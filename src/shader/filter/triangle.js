/**
 * Created by eason on 1/26/18.
 */
function triangle(d,radius){
    return Math.max(0.0,radius - d);
}

function Triangle_param(windowWidth){

    return function(pluginParams){
        let r = pluginParams.getParam("r");
        let length = windowWidth*windowWidth;
        let result = `
        #define FILTER_WINDOW_WIDTH ${windowWidth}
        #define FILTER_WINDOW_LENGTH ${length}
        #define FILTER_WINDOW_RADIUS ${pluginParams.params.r}
        float windowWeightTable[FILTER_WINDOW_LENGTH] = float[FILTER_WINDOW_LENGTH](`;

        let offset = 0;
        for(let i=0;i<windowWidth;i++){
            for(let j=0;j<windowWidth;j++,offset++){
                let p = {
                    x:(j + 0.5) * r[0] / windowWidth,
                    y:(i + 0.5) * r[1] / windowWidth
                };
                let weight = triangle(p.x,r[0])
                    *triangle(p.y,r[1])+'';
                if(!weight.includes('.')) weight+='.0';
                result += weight;
                if(offset<length-1) result+=',';
                else result+=');';
            }
        }

        return result;
    }
}

export {Triangle_param};