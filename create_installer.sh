#!/bin/bash

# === Settings ===
PROJECT_DIR="."                         # Use current directory (BMI project folder)
ARCHIVE_NAME="bmi-project.tar.gz"       # Compressed file name
B64_NAME="bmi-project.b64"              # Base64 version
INSTALL_SCRIPT="install_bmi_project.sh" # Final output script

# === Compress the project ===
# Excluding node_modules, dist, and other unnecessary folders
echo "Compressing project..."
tar --exclude="node_modules" --exclude="dist" --exclude=".angular" \
    --exclude=".git" --exclude="$ARCHIVE_NAME" --exclude="$B64_NAME" \
    --exclude="$INSTALL_SCRIPT" -czf "$ARCHIVE_NAME" "$PROJECT_DIR"

# === Encode to Base64 ===
echo "Encoding to Base64..."
base64 "$ARCHIVE_NAME" > "$B64_NAME"

# === Generate Installer Script ===
echo "Creating installer script..."
cat <<EOF > "$INSTALL_SCRIPT"
#!/bin/bash

# BMI Project Installer
# Generated on $(date)

echo "✅ BMI Project Installer"
echo "----------------------------------------"
echo "This script will extract the BMI Angular project"
echo "and set up the development environment."
echo ""

# Create target directory
read -p "Enter target directory (default: ./bmi-project): " TARGET_DIR
TARGET_DIR=\${TARGET_DIR:-"./bmi-project"}

if [ -d "\$TARGET_DIR" ]; then
  read -p "Directory exists. Overwrite? (y/n): " OVERWRITE
  if [ "\$OVERWRITE" != "y" ]; then
    echo "Installation aborted."
    exit 1
  fi
fi

mkdir -p "\$TARGET_DIR"

echo "⏳ Extracting project files..."
cat <<B64END | base64 -d > "\$TARGET_DIR/$ARCHIVE_NAME"
$(cat "$B64_NAME")
B64END

# Extract the archive
cd "\$TARGET_DIR"
tar -xzf "$ARCHIVE_NAME"
rm "$ARCHIVE_NAME"

echo "✅ Project extracted to \$TARGET_DIR"
echo ""
echo "To complete setup:"
echo "1. cd \$TARGET_DIR"
echo "2. npm install --legacy-peer-deps"
echo "3. ng serve"
echo ""
echo "Thank you for using BMI Project Installer!"
EOF

chmod +x "$INSTALL_SCRIPT"

# === Clean up temporary files ===
rm "$ARCHIVE_NAME" "$B64_NAME"

echo "✅ Generated: $INSTALL_SCRIPT"
echo "This installer script can be distributed to quickly set up the BMI project environment."
