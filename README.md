# 家庭菜单

一个部署在 GitHub Pages 上的静态家庭菜单。所有菜品平铺展示，不依赖后端或数据库。

## 更新菜单

编辑 [`data/menu.js`](data/menu.js) 中的 `dishes` 数组：

```js
{
  name: "番茄炒蛋",
  tags: ["快手"],
}
```

只有 `name` 必填；`tags` 可以省略。数组中的先后顺序就是页面展示顺序。

修改菜单后推送到 `main` 分支，GitHub Actions 会自动部署最新页面。

## 启用 GitHub Pages

首次发布前，在仓库的 **Settings → Pages → Build and deployment** 中，将 Source 设为 **GitHub Actions**。

## 本地预览

可以直接双击 `index.html` 打开，也可以在项目目录启动任意静态文件服务器：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000`。
