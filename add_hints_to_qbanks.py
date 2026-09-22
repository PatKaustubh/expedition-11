"""
add_hints_to_qbanks.py
Bulk-adds hint_1, hint_2, hint_3 fields to all questions in:
  - question_bank.json  (class 12, fields: question/options/answer/explanation)
  - physics_question_bank.json (class 11, same schema)

Also normalises answer from letter "B" → numeric index 1, and strips
leading "A) " / "B) " prefixes from options so the app renders them cleanly.

Hint derivation from explanation text:
  hint_1 = first sentence (conceptual nudge, ≤120 chars)
  hint_2 = second sentence or formula keyword extraction
  hint_3 = first 2 sentences joined (partial walkthrough)
"""

import json, re, textwrap, pathlib, sys

# ── helpers ───────────────────────────────────────────────────────────────────

def split_sentences(text):
    """Split explanation into sentences, cleaning whitespace."""
    text = re.sub(r'\s+', ' ', text).strip()
    # Split on '. ' or '.' at end
    parts = re.split(r'(?<=[.!?])\s+', text)
    return [p.strip() for p in parts if p.strip()]

def derive_hints(q_text, opts, ans_idx, explanation):
    """Generate 3-tier hints from explanation + question context."""
    exp = (explanation or '').strip()
    sentences = split_sentences(exp)

    # hint_1 — conceptual nudge: first sentence, max 150 chars
    if sentences:
        h1 = sentences[0]
        if len(h1) > 150:
            h1 = h1[:147] + '…'
    else:
        # Fallback: generic nudge based on question topic
        h1 = "Think about the core concept this question is testing."

    # hint_2 — formula/method cue: second sentence, or extract formula patterns
    formula_patterns = re.findall(
        r'[A-Za-z]+\s*[=≈]\s*[^,\.]+|[A-Za-z]+\s*∝\s*[^,\.]+|'
        r'\d+[×x]\d+|\b[A-Z]\s*=\s*[^,\.]{3,30}',
        exp
    )
    if len(sentences) > 1:
        h2 = sentences[1]
        if len(h2) > 150: h2 = h2[:147] + '…'
    elif formula_patterns:
        h2 = f"Key relation: {formula_patterns[0].strip()}"
    else:
        h2 = "Identify the relevant formula or method for this topic."

    # hint_3 — partial solution: first 2 sentences as a walkthrough starter
    if len(sentences) >= 2:
        h3 = ' '.join(sentences[:2])
        if len(h3) > 220: h3 = h3[:217] + '…'
    elif sentences:
        h3 = sentences[0]
    else:
        h3 = "Work step-by-step from the given values using first principles."

    return h1, h2, h3

def letter_to_index(letter, options):
    """Convert answer letter 'B' to index 1."""
    letter = str(letter).strip().upper().rstrip(')')
    if letter in 'ABCD':
        return 'ABCD'.index(letter)
    # Try numeric
    try:
        return int(letter)
    except ValueError:
        return 0

def clean_option(opt):
    """Strip leading 'A) ', 'B) ', etc. from option text."""
    return re.sub(r'^[A-Da-d][)\.]?\s*', '', str(opt)).strip()

# ── process a single question dict (in-place) ────────────────────────────────

def process_question(q):
    """Normalise field names and add hints. Returns modified q."""
    # Normalise field names: question→q, options→opts, answer→ans, explanation→exp
    if 'question' in q and 'q' not in q:
        q['q'] = q['question']
    if 'options' in q and 'opts' not in q:
        raw_opts = q['options']
        q['opts'] = [clean_option(o) for o in raw_opts]
    if 'answer' in q and 'ans' not in q:
        q['ans'] = letter_to_index(q['answer'], q.get('opts', q.get('options', [])))
    if 'explanation' in q and 'exp' not in q:
        q['exp'] = q['explanation']

    # Derive hints if not already present
    if not q.get('hint_1'):
        h1, h2, h3 = derive_hints(
            q.get('q', q.get('question', '')),
            q.get('opts', q.get('options', [])),
            q.get('ans', 0),
            q.get('exp', q.get('explanation', ''))
        )
        q['hint_1'] = h1
        q['hint_2'] = h2
        q['hint_3'] = h3

    return q

# ── process a file ────────────────────────────────────────────────────────────

def process_file(path):
    p = pathlib.Path(path)
    if not p.exists():
        print(f"SKIP (not found): {path}")
        return

    print(f"Processing {path} …", end=' ', flush=True)
    data = json.loads(p.read_text(encoding='utf-8-sig'))

    count = 0

    # question_bank.json: { subjects: [ { topics: [ { levels: [ { questions: [] } ] } ] } ] }
    if isinstance(data, dict) and 'subjects' in data:
        for subj in data['subjects']:
            for topic in subj.get('topics', []):
                for level in topic.get('levels', []):
                    for i, q in enumerate(level.get('questions', [])):
                        level['questions'][i] = process_question(q)
                        count += 1

    # physics_question_bank.json: { topics: [ { levels: [ { questions: [] } ] } ] }
    elif isinstance(data, dict) and 'topics' in data:
        for topic in data['topics']:
            for level in topic.get('levels', []):
                for i, q in enumerate(level.get('questions', [])):
                    level['questions'][i] = process_question(q)
                    count += 1

    # Flat array
    elif isinstance(data, list):
        for i, q in enumerate(data):
            data[i] = process_question(q)
            count += 1

    out = json.dumps(data, ensure_ascii=False, indent=2)
    p.write_text(out, encoding='utf-8')
    print(f"done — {count} questions processed.")

# ── main ──────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    files = sys.argv[1:] if len(sys.argv) > 1 else [
        'question_bank.json',
        'physics_question_bank.json',
    ]
    for f in files:
        process_file(f)
    print("All done.")
