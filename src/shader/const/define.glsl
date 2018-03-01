#define OBJECTS_LENGTH 17.0
#define LIGHTS_LENGTH 17.0
#define TEX_PARAMS_LENGTH 15.0

#define MAX_DISTANCE 1e5
#define MAXBOUNCES 5
#define EPSILON 1e-5
#define ONEMINUSEPSILON 0.9999
#define INF 1e5
#define PI 3.141592653589793
#define INVPI 0.3183098861837907
#define INV2PI 0.159154943091895
#define INV4PI 0.079577471545947
#define PIOVER2 1.570796326794896
#define PIOVER4 0.785398163397448
#define SQRT2 1.414213562373095

#define CUBE 1
#define SPHERE 2
#define RECTANGLE 3
#define CONE 4
#define CYLINDER 5
#define DISK 6
#define HYPERBOLOID 7
#define PARABOLOID 8
#define CORNELLBOX 9

#define AREA 0
#define POINT 1

#define MATTE 1
#define MIRROR 2
#define METAL 3
#define GLASS 4

//纹理1-4空出来用于图片纹理索引
#define UNIFORM_COLOR 0
#define CHECKERBOARD 5
#define CHECKERBOARD2 7
#define BILERP 8
#define MIXF 9
#define SCALE 10
#define UVF 11

#define BLACK vec3(0.0,0.0,0.0)
#define WHITE vec3(1.0,1.0,1.0)
#define GREY vec3(0.5,0.5,0.5)
#define RED vec3(0.75,0.25,0.25)
#define BLUE vec3(0.25, 0.25, 0.75)
#define GREEN vec3(0.25, 0.75, 0.25)

#define NC 1.0

#define NOOP 0
#define CONDUCTOR 1
#define DIELECTRIC 2

#define BECKMANN 1
#define TROWBRIDGEREITZ 2

#define OBJECT_SPACE_N vec3(0,1,0)
#define OBJECT_SPACE_S vec3(0,0,-1)
#define OBJECT_SPACE_T vec3(1,0,0)
