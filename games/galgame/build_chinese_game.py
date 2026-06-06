"""
FINAL FIXED BUILD: Embeds all images in game.zip, disables progressive download.
No server-side files needed - everything is in the zip.
"""
import os, shutil, subprocess, zipfile, json, re

EXTRACTED = r'E:\HCI_project\games\galgame\game\game_extracted\game'
BACKUP = r'E:\HCI_project\games\galgame\game\game_extracted_backup\game'
ZIP_BAK = r'E:\HCI_project\games\galgame\game\game.zip.bak'
ZIP_PATH = r'E:\HCI_project\games\galgame\game\game.zip'
RENPY_PYTHON = r'D:/renpy-8.5.3-sdk/lib/py3-windows-x86_64/python.exe'
RENPY_PY = r'D:/renpy-8.5.3-sdk/renpy.py'
TMP = r'D:/renpy_final_build'

print("=" * 60)
print("FINAL FIXED BUILD - All images in zip")
print("=" * 60)

# ===== Load translations =====
BATCH = r'E:/HCI_project/games/galgame/batch_translations.json'
T = {}
if os.path.exists(BATCH):
    with open(BATCH, 'r', encoding='utf-8') as f:
        T = json.load(f)
    print(f"Loaded {len(T)} translations")

# ===== STEP 1: Restore clean English files =====
print("\n[1/5] Restoring clean English files...")
for root, dirs, files in os.walk(EXTRACTED):
    dirs[:] = [d for d in dirs if d not in {'renpy', 'tl'}]
    for fn in files:
        if fn.endswith('.rpy'):
            fp = os.path.join(root, fn)
            rel = os.path.relpath(fp, EXTRACTED)
            bp = os.path.join(BACKUP, rel)
            if os.path.exists(bp):
                shutil.copy2(bp, fp)
print("  OK")

# ===== STEP 2: Apply translations =====
print("\n[2/5] Applying translations...")
total_cn = 0
applied_files = 0
for root, dirs, files in os.walk(EXTRACTED):
    dirs[:] = [d for d in dirs if d not in {'renpy', 'tl', 'python-packages', 'cache'}]
    for fn in files:
        if fn.endswith('.rpy') and fn not in ('code_snippet_example_screen.rpy', 'quiz_questions_from_csv.rpy'):
            fp = os.path.join(root, fn)
            with open(fp, 'r', encoding='utf-8') as f:
                content = f.read()
            org = content
            changes = 0
            for en, zh in T.items():
                old = '"' + en + '"'
                new = '"' + zh + '"'
                if old in content:
                    content = content.replace(old, new)
                    changes += 1
            if changes > 0:
                with open(fp, 'w', encoding='utf-8') as f:
                    f.write(content)
                cn = sum(1 for c in content if '一' <= c <= '鿿')
                total_cn += cn
                applied_files += 1
                print(f"  {fn}: {changes} changes, {cn} Chinese chars")
print(f"  Applied: {applied_files} files, {total_cn} Chinese chars")

# ===== STEP 3: Set up temp dir with images embedded =====
print("\n[3/5] Setting up build directory (images in game/)...")
if os.path.exists(TMP):
    shutil.rmtree(TMP)
os.makedirs(TMP)

# Extract original zip
with zipfile.ZipFile(ZIP_BAK, 'r') as z:
    z.extractall(TMP)
print("  Original extracted")

# Copy FULL QUALITY images from disk (not placeholders)
disk_images = r'E:/HCI_project/games/galgame/game/images'
game_images = os.path.join(TMP, 'game', 'images')
if os.path.exists(disk_images):
    # Remove old placeholder images first
    if os.path.exists(game_images):
        shutil.rmtree(game_images)
    shutil.copytree(disk_images, game_images)
    total = sum(1 for r, d, fs in os.walk(game_images) for f in fs)
    print(f"  Copied {total} full-quality images to game/images/")

# Also copy full-quality audio from disk
disk_audio = r'E:/HCI_project/games/galgame/game/audio'
game_audio = os.path.join(TMP, 'game', 'audio')
if os.path.exists(disk_audio):
    if os.path.exists(game_audio):
        shutil.rmtree(game_audio)
    shutil.copytree(disk_audio, game_audio)
    total_audio = sum(1 for r, d, fs in os.walk(game_audio) for f in fs)
    print(f"  Copied {total_audio} full-quality audio files to game/audio/")

# Also copy game/audio/ from zip (already there from extraction)

# Disable progressive download - keep everything in zip
pd_path = os.path.join(TMP, 'progressive_download.txt')
with open(pd_path, 'w') as f:
    f.write('# All files kept in zip - no progressive download needed\n')
print("  Disabled progressive download")

# Replace .rpy with translated versions
game_tmp = os.path.join(TMP, 'game')
rpy_count = 0
for root, dirs, files in os.walk(EXTRACTED):
    dirs[:] = [d for d in dirs if d not in {'renpy', 'tl', 'python-packages', 'cache'}]
    for fn in files:
        if fn.endswith('.rpy'):
            src = os.path.join(root, fn)
            rel = os.path.relpath(src, EXTRACTED)
            dst = os.path.join(game_tmp, rel)
            if os.path.exists(dst):
                shutil.copy2(src, dst)
                rpy_count += 1
print(f"  Copied {rpy_count} translated .rpy files")

# Also copy _placeholders/ to TMP (RenPy SDK needs it for compile)
ph_src = os.path.join(os.path.dirname(EXTRACTED), '_placeholders')
ph_dst = os.path.join(TMP, '_placeholders')
if os.path.exists(ph_src) and not os.path.exists(ph_dst):
    shutil.copytree(ph_src, ph_dst)

# ===== STEP 4: Compile with Ren'Py SDK =====
print("\n[4/5] Compiling with Ren'Py SDK...")
result = subprocess.run([RENPY_PYTHON, RENPY_PY, TMP, 'compile'],
    capture_output=True, timeout=120, encoding='utf-8', errors='replace')
if result.returncode != 0:
    print("COMPILE FAILED:", (result.stdout or '')[-300:])
    shutil.rmtree(TMP)
    exit(1)
print("  OK")

# Copy compiled .rpyc back
rpyc_count = 0
for root, dirs, files in os.walk(game_tmp):
    for fn in files:
        if fn.endswith('.rpyc'):
            src = os.path.join(root, fn)
            rel = os.path.relpath(src, game_tmp)
            dst = os.path.join(EXTRACTED, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst)
            rpyc_count += 1
print(f"  {rpyc_count} .rpyc compiled")

# ===== STEP 5: Build game.zip =====
print("\n[5/5] Building game.zip with ALL images...")
new_zip = ZIP_PATH + '.new'
with zipfile.ZipFile(new_zip, 'w', zipfile.ZIP_DEFLATED) as zout:
    for root, dirs, files in os.walk(TMP):
        for fn in files:
            fp = os.path.join(root, fn)
            arcname = os.path.relpath(fp, TMP).replace('\\', '/')
            zout.write(fp, arcname)

os.remove(ZIP_PATH)
os.rename(new_zip, ZIP_PATH)

# Verify
with zipfile.ZipFile(ZIP_PATH, 'r') as z:
    names = z.namelist()
    imgs = sum(1 for n in names if n.lower().endswith(('.png', '.jpg', '.webp')))
    game_imgs = sum(1 for n in names if n.startswith('game/images/') and not n.endswith('/'))
    entries = len(names)

shutil.rmtree(TMP)
sz = os.path.getsize(ZIP_PATH) / (1024 * 1024)
print(f"  {sz:.1f}MB, {entries} entries, {imgs} images ({game_imgs} in game/images/)")
print(f"\n{'=' * 60}")
print(f"BUILD COMPLETE! All images embedded in zip.")
print(f"Translations: {total_cn} Chinese chars, {applied_files} files")
print(f"No progressive download - game will work offline!")
print(f"{'=' * 60}")
