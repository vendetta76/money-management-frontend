#!/bin/bash

echo "🧹 Menghapus fitur admin (custom claims based)..."

# File yang akan dihapus
rm -f controllers/adminController.js
rm -f routes/adminRoutes.js
rm -f setAdminClaim.js

# Hapus baris import & use di server.js (pakai sed)
sed -i '/import adminRoutes from .\/routes\/adminRoutes.js/d' server.js
sed -i '/app.use(.*\/api\/admin.*);/d' server.js

# Hapus middleware adminOnly dari authMiddleware.js
sed -i '/export const adminOnly/,/^}/d' controllers/authMiddleware.js

echo "✅ Selesai. Semua file & hook terkait fitur admin telah dibersihkan."
