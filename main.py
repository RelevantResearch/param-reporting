import os
import json
from pathlib import Path

def create_html_index(folder_path="facility", output_file="index.json"):
    """
    Create a JSON index of HTML files in the specified folder
    
    Args:
        folder_path (str): Path to the folder containing HTML files
        output_file (str): Name of the output JSON file
    """
    
    # Check if folder exists
    if not os.path.exists(folder_path):
        print(f"Error: Folder '{folder_path}' does not exist.")
        return
    
    # List to store filenames
    html_files = []
    
    # Get all HTML files in the folder
    folder = Path(folder_path)
    for file_path in folder.glob("*.html"):
        # Get just the filename without extension
        filename_without_ext = file_path.stem
        
        # Convert filename to title case (Adams County Det Center)
        formatted_name = filename_without_ext.replace('_', ' ').title()
        
        # Add filename and formatted name to the list
        html_files.append({
            "filename": file_path.name,
            "name": formatted_name
        })
    
    # Sort the list by filename for consistency
    html_files.sort(key=lambda x: x['filename'])
    
    # Create the JSON structure
    index_data = {
        "total_files": len(html_files),
        "files": html_files
    }
    
    # Write to JSON file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(index_data, f, indent=2, ensure_ascii=False)
        
        print(f"Successfully created {output_file} with {len(html_files)} HTML files")
        print(f"Files indexed:")
        for file_info in html_files:
            print(f"  - {file_info['filename']} -> {file_info['name']}")
            
    except Exception as e:
        print(f"Error writing to {output_file}: {e}")

if __name__ == "__main__":
    # Run the indexer
    create_html_index()
    
    # Optional: Display the created JSON content
    try:
        with open("index.json", 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"\nJSON content preview:")
            print(json.dumps(data, indent=2))
    except Exception as e:
        print(f"Error reading index.json: {e}")