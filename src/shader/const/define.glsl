#define OBJECTS_LENGTH 16.0
#define TEX_PARAMS_LENGTH 6.0

#define MAX_DISTANCE 1e5
#define MAXBOUNCES 5
#define EPSILON 1e-4
#define PI 3.141592653589793
#define INVPI 0.3183098861837907

#define CUBE 1
#define SPHERE 2
#define PLANE 3
#define CONE 4
#define CYLINDER 5
#define DISK 6
#define HYPERBOLOID 7
#define PARABOLOID 8

#define MATTE 1
#define MIRROR 2
#define METAL 3
#define TRANSMISSION 4

//纹理1-4空出来用于图片纹理索引
#define UNIFORM_COLOR 0
#define CHECKERBOARD 5
#define CORNELLBOX 6

#define BLACK vec3(0.0,0.0,0.0)
#define WHITE vec3(1.0,1.0,1.0)
#define GREY vec3(0.5,0.5,0.5)
#define RED vec3(0.75,0.25,0.25)
#define BLUE vec3(0.1, 0.5, 1.0)
#define YELLOW vec3(1.0, 0.9, 0.1)

#define NC 1.0

#define OBJECT_SPACE_N vec3(0,1,0)
#define OBJECT_SPACE_S vec3(1,0,0)
#define OBJECT_SPACE_T vec3(0,0,-1)
