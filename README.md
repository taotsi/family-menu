# 家庭菜单

一个部署在 GitHub Pages 上的静态家庭菜单。所有菜品平铺展示，不依赖后端或数据库。

## 更新菜单

编辑 [`data/menu.js`](data/menu.js) 中的 `dishes` 数组：

```js
{
  name: "清蒸鲈鱼",
  ingredients: ["水产", "鱼", "鲈鱼"],
  methods: ["蒸"],
}
```

只有 `name` 必填；`ingredients`（材料）和 `methods`（做法）可以省略。同一种标签可以有多个不同粒度，例如“鱼”和“鲈鱼”。数组中的先后顺序就是页面展示顺序。页面会从菜单数据中自动生成筛选项。

材料的展示层级由同一文件中的 `ingredientTree` 定义。菜品仍然保持平铺；层级只用于筛选界面。选择父级会替代其已选子级，兄弟节点和不同分支可以同时选择。

修改菜单后推送到 `main` 分支，GitHub Actions 会自动部署最新页面。

## 启用 GitHub Pages

首次发布前，在仓库的 **Settings → Pages → Build and deployment** 中，将 Source 设为 **GitHub Actions**。

## 本地预览

可以直接双击 `index.html` 打开，也可以在项目目录启动任意静态文件服务器：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000`。
