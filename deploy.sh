#!/bin/bash
# 八字排盘 APP 一键部署脚本
# 在腾讯云网页终端中粘贴运行即可

set -e
echo "=== 八字排盘 APP 部署开始 ==="
echo ""

# ---------- 1. 安装 Node.js 20 LTS ----------
echo "[1/9] 安装 Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# ---------- 2. 安装系统工具 ----------
echo "[2/9] 安装 Nginx / PostgreSQL / Git..."
apt-get install -y nginx postgresql postgresql-contrib git build-essential

# ---------- 3. 安装 PM2 ----------
echo "[3/9] 安装 PM2..."
npm install -g pm2

# ---------- 4. 创建数据库 ----------
echo "[4/9] 配置 PostgreSQL..."
sudo -u postgres psql -c "CREATE USER bazi WITH PASSWORD 'bazi123456';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE bazi_db OWNER bazi;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bazi_db TO bazi;" 2>/dev/null || true

# ---------- 5. 克隆代码 ----------
echo "[5/9] 克隆代码仓库..."
cd /home
rm -rf canku123
git clone https://github.com/messirymark/canku123.git
chown -R $(whoami):$(whoami) canku123
cd canku123

# ---------- 6. 安装依赖 ----------
echo "[6/9] 安装 npm 依赖..."
npm install

# ---------- 7. 环境配置 ----------
echo "[7/9] 创建环境配置..."
cat > .env << 'EOF'
DATABASE_URL=postgresql://bazi:bazi123456@localhost:5432/bazi_db
PORT=3000
EOF

# ---------- 8. 构建 ----------
echo "[8/9] 构建项目..."
npm run build

# ---------- 9. 启动服务 ----------
echo "[9/9] 启动应用 + Nginx..."
pm2 delete bazi-app 2>/dev/null || true
pm2 start npm --name "bazi-app" -- start
pm2 save
env PATH=$PATH:/usr/bin pm2 startup systemd -u $(whoami) --hp /home/$(whoami) 2>/dev/null || true

# ---------- Nginx 反向代理 ----------
echo "配置 Nginx..."
cat > /etc/nginx/sites-available/bazi << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/bazi /etc/nginx/sites-enabled/bazi
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx

# ---------- 完成 ----------
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "124.221.53.189")

echo ""
echo "============================================"
echo "  ✅ 部署完成！"
echo ""
echo "  访问地址: http://$PUBLIC_IP"
echo "  PM2 管理: pm2 status"
echo "  查看日志: pm2 logs bazi-app"
echo "  重启应用: pm2 restart bazi-app"
echo ""
echo "  ⚠️ 记得在腾讯云防火墙开放 80 端口"
echo "     控制台→防火墙→添加规则→TCP:80"
echo ""
echo "  📋 PostgreSQL 信息:"
echo "     数据库: bazi_db"
echo "     用户名: bazi"
echo "     密码:   bazi123456"
echo "============================================"
