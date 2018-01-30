struct Intersect{
    float d;
    vec3 hit;
    vec3 normal;
    vec3 dpdu,dpdv;
    bool into;
    float matIndex;//材质索引
    vec3 sc;//表面颜色
    vec3 emission;
    float seed;//随机种子
    int index;
    int matCategory;
};

struct Ray{
    vec3 origin;
    vec3 dir;
};