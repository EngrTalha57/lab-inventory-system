# -*- mode: python ; coding: utf-8 -*-
import os
from PyInstaller.utils.hooks import collect_all

# --- PATH DEFINITIONS ---
# Direct path to your Python 3.11 DLLs where you found libcrypto and libffi
python_dll_path = r'C:\Users\Talha Mushtaq\AppData\Local\Programs\Python\Python311\DLLs'

datas = [('dist', 'dist')]

# --- BINARY FIX SECTION ---
# Explicitly adding SSL and CTYPES binaries to the build
binaries = [
    # SSL Binaries
    (os.path.join(python_dll_path, 'libcrypto-1_1.dll'), '.'),
    (os.path.join(python_dll_path, 'libssl-1_1.dll'), '.'),
    (os.path.join(python_dll_path, '_ssl.pyd'), '.'),
    # CTYPES Binaries (Fixes the current error)
    (os.path.join(python_dll_path, '_ctypes.pyd'), '.'),
    (os.path.join(python_dll_path, 'libffi-8.dll'), '.'),
]

hiddenimports = ['main']

# Collect all uvicorn dependencies for bundling
tmp_ret = collect_all('uvicorn')
datas += tmp_ret[0]
binaries += tmp_ret[1]
hiddenimports += tmp_ret[2]

a = Analysis(
    ['run_server.py'],
    pathex=[python_dll_path],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='run_server',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False, 
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='run_server',
)