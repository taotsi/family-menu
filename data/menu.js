globalThis.FAMILY_MENU = {
  ingredientTree: [
    {
      name: "肉类",
      children: [
        {
          name: "猪肉",
          children: ["排骨", "大骨", "肉末", "腰花"],
        },
        "鸡肉",
        "鸭肉",
      ],
    },
    {
      name: "水产",
      children: [
        {
          name: "鱼",
          children: ["鲈鱼", "鲫鱼", "鳕鱼", "笋壳鱼", "鱼头"],
        },
        {
          name: "虾",
          children: ["小河虾"],
        },
        "螃蟹",
      ],
    },
    {
      name: "蔬菜",
      children: ["苋菜", "西红柿", "干菜", "丝瓜", "酸菜", "豆角", "西葫芦"],
    },
    {
      name: "豆制品",
      children: ["豆腐"],
    },
    {
      name: "主食",
      children: ["年糕", "米饭"],
    },
    "蛋",
  ],
  dishes: [
    { name: "生炒鸡", ingredients: ["肉类", "鸡肉"], methods: ["炒"] },
    { name: "炒苋菜", ingredients: ["蔬菜", "苋菜"], methods: ["炒"] },
    { name: "水煮小河虾", ingredients: ["水产", "虾", "小河虾"], methods: ["煮"] },
    { name: "清蒸笋壳鱼", ingredients: ["水产", "鱼", "笋壳鱼"], methods: ["蒸"] },
    { name: "清蒸鲈鱼", ingredients: ["水产", "鱼", "鲈鱼"], methods: ["蒸"] },
    { name: "西红柿炒鸡蛋", ingredients: ["蔬菜", "西红柿", "蛋"], methods: ["炒"] },
    { name: "家常豆腐", ingredients: ["豆制品", "豆腐"], methods: ["烧"] },
    { name: "干菜丝瓜汤", ingredients: ["蔬菜", "干菜", "丝瓜"], methods: ["煮"] },
    { name: "年糕泡饭", ingredients: ["主食", "年糕", "米饭"], methods: ["煮"] },
    { name: "小炒肉", ingredients: ["肉类", "猪肉"], methods: ["炒"] },
    { name: "清炖排骨", ingredients: ["肉类", "猪肉", "排骨"], methods: ["炖"] },
    { name: "红烧排骨", ingredients: ["肉类", "猪肉", "排骨"], methods: ["烧"] },
    { name: "酸菜炖大骨", ingredients: ["肉类", "猪肉", "大骨", "蔬菜", "酸菜"], methods: ["炖"] },
    { name: "煎鳕鱼", ingredients: ["水产", "鱼", "鳕鱼"], methods: ["煎"] },
    { name: "肉末豆角", ingredients: ["肉类", "猪肉", "肉末", "蔬菜", "豆角"], methods: ["炒"] },
    { name: "蒸鸡", ingredients: ["肉类", "鸡肉"], methods: ["蒸"] },
    { name: "醋溜鱼头", ingredients: ["水产", "鱼", "鱼头"], methods: ["烧"] },
    { name: "醋溜西葫芦", ingredients: ["蔬菜", "西葫芦"], methods: ["炒"] },
    { name: "花椒鸭", ingredients: ["肉类", "鸭肉"], methods: ["烧"] },
    { name: "红烧鸭", ingredients: ["肉类", "鸭肉"], methods: ["烧"] },
    { name: "糖醋排骨", ingredients: ["肉类", "猪肉", "排骨"], methods: ["烧"] },
    { name: "炖鸡", ingredients: ["肉类", "鸡肉"], methods: ["炖"] },
    { name: "清蒸鲫鱼", ingredients: ["水产", "鱼", "鲫鱼"], methods: ["蒸"] },
    { name: "干菜小河虾汤", ingredients: ["水产", "虾", "小河虾", "蔬菜", "干菜"], methods: ["煮"] },
    { name: "腰花汤", ingredients: ["肉类", "猪肉", "腰花"], methods: ["煮"] },
    { name: "清蒸螃蟹", ingredients: ["水产", "螃蟹"], methods: ["蒸"] },
  ],
};
