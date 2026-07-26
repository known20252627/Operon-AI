import os

def fix_mojibake(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    try:
        # Try to reverse double encoding (utf-8 read as cp1252/latin1 and saved as utf-8)
        content = content.encode('cp1252').decode('utf-8')
    except UnicodeEncodeError:
        pass
    except UnicodeDecodeError:
        pass

    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {file_path}")
        return True
    return False

def scan_dir(directory):
    count = 0
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.css')):
                if fix_mojibake(os.path.join(root, file)):
                    count += 1
    print(f"Total files fixed: {count}")

if __name__ == "__main__":
    scan_dir('src')
