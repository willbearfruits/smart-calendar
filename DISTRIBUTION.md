# Distribution Guide - Paper2Plan Standalone App

## ✅ Built Executables

Your standalone desktop apps have been created in the `release/` directory:

### 📦 Available Downloads

| File | Size | Platform | Description |
|------|------|----------|-------------|
| **Paper2Plan-1.0.0.AppImage** | 144 MB | Linux (Universal) | Works on any Linux distro - just download and run |
| **paper2plan_1.0.0_amd64.deb** | 87 MB | Ubuntu/Debian | Double-click to install on Ubuntu, Debian, Linux Mint, etc. |

---

## 🚀 For End Users

### **Option 1: AppImage (Recommended - Works Everywhere)**

```bash
# 1. Download the file
# Paper2Plan-1.0.0.AppImage

# 2. Make it executable
chmod +x Paper2Plan-1.0.0.AppImage

# 3. Run it!
./Paper2Plan-1.0.0.AppImage
```

**Pros**: No installation needed, works on any Linux distro, portable

### **Option 2: DEB Package (Ubuntu/Debian)**

```bash
# 1. Download the file
# paper2plan_1.0.0_amd64.deb

# 2. Install it
sudo dpkg -i paper2plan_1.0.0_amd64.deb

# Or double-click the file in your file manager

# 3. Launch from applications menu
# Or run: paper2plan
```

**Pros**: Integrates with system, appears in app menu, handles updates

---

## 🔑 **IMPORTANT: Gemini API Key Setup**

The app needs a Gemini API key to work. Users have two options:

### **Option A: Environment Variable** (Recommended)

```bash
# Set the API key before running
export GEMINI_API_KEY="your_actual_api_key_here"

# Then run the app
./Paper2Plan-1.0.0.AppImage
```

### **Option B: Config File** (Persistent)

Create a config file at `~/.config/paper2plan/config.json`:

```json
{
  "GEMINI_API_KEY": "your_actual_api_key_here"
}
```

---

## 📤 Distribution Methods

### **1. GitHub Releases** (Recommended)

```bash
# 1. Create a new release on GitHub
# 2. Upload both files:
#    - Paper2Plan-1.0.0.AppImage
#    - paper2plan_1.0.0_amd64.deb
# 3. Write release notes with setup instructions
```

### **2. Direct Download**

Host the files on:
- Your own website
- Google Drive / Dropbox / OneDrive (with shared links)
- File hosting services

### **3. Flathub / Snap Store** (Future)

For wider distribution, consider packaging as:
- **Flatpak** for Flathub
- **Snap** for Snap Store

---

## 🛠️ For Developers

### **Building from Source**

```bash
# Clone the repository
git clone https://github.com/yourusername/paper2plan.git
cd paper2plan

# Install dependencies
npm install
npm run server:install

# Build standalone apps
npm run electron:build:linux    # Linux (AppImage, .deb, .rpm)
npm run electron:build:win      # Windows (.exe, portable)
npm run electron:build:mac      # macOS (.dmg, .app)
npm run electron:build:all      # All platforms

# Output in: release/
```

### **Development Mode**

```bash
# Run with hot reload (all 3 processes)
npm run electron:dev
```

This starts:
1. Frontend (Vite dev server)
2. Backend (Node server with nodemon)
3. Electron window

---

## 📋 What's Included in the Standalone App

✅ **Frontend**: Full React app (minified)
✅ **Backend**: Node.js Express server (embedded)
✅ **Dependencies**: All npm packages bundled
✅ **No External Requirements**: Everything self-contained

**Users don't need**:
- Node.js installed
- npm installed
- Any build tools
- Terminal commands

Just **download, run, and add API key**!

---

## 🔒 Security Notes

1. **API Key**: Never hardcode API keys in the distributed app
2. **Config File**: Stored in user's home directory (not in the app)
3. **Auto-Updates**: Consider implementing update checks in future versions
4. **Code Signing**: For macOS/Windows, you'll need to sign the binaries

---

## 📦 Package Sizes

| Component | Size |
|-----------|------|
| Electron Runtime | ~80 MB |
| Frontend (React) | ~3 MB |
| Backend (Node + deps) | ~30 MB |
| App Code | ~1 MB |
| **Total AppImage** | **~144 MB** |
| **Total DEB** | **~87 MB** |

---

## 🌍 Multi-Platform Builds

### **Windows**

```bash
npm run electron:build:win
```

Creates:
- `Paper2Plan Setup 1.0.0.exe` (installer)
- `Paper2Plan-1.0.0-portable.exe` (portable)

### **macOS**

```bash
npm run electron:build:mac
```

Creates:
- `Paper2Plan-1.0.0.dmg` (installer)
- `Paper2Plan-1.0.0-mac.zip` (portable)

**Note**: macOS builds require a Mac computer or CI service

---

## 📝 Release Checklist

Before releasing:

- [ ] Update version in `package.json`
- [ ] Clean all personal data from code
- [ ] Test on fresh Linux install
- [ ] Write release notes
- [ ] Create installation guide
- [ ] Setup API key instructions
- [ ] Upload to GitHub Releases
- [ ] Update README with download links
- [ ] Test download links work
- [ ] Announce release

---

## 🎯 Future Enhancements

- **Auto-updater**: Notify users of new versions
- **Installer wizard**: Guide users through API key setup
- **Flatpak/Snap**: Distribution on Linux stores
- **Code signing**: For Windows/macOS trust
- **Portable mode**: USB drive support
- **Multiple profiles**: Different users/API keys

---

## 📞 Support

Users can:
- Check the README for basic usage
- File issues on GitHub
- Contact via email (set in package.json)

---

**Your app is ready to share with the world!** 🚀
