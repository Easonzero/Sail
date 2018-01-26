/**
 * Created by eason on 1/26/18.
 */
function mitchell(x,B,C){
    x = Math.abs(2 * x);
    if (x > 1)
        return ((-B - 6 * C) * x * x * x + (6 * B + 30 * C) * x * x +
            (-12 * B - 48 * C) * x + (8 * B + 24 * C)) *
            (1.0 / 6.0);
    else
        return ((12 - 9 * B - 6 * C) * x * x * x +
            (-18 + 12 * B + 6 * C) * x * x + (6 - 2 * B)) *
            (1.0 / 6.0);
}

function Mitchell_param(windowWidth){

    return function(pluginParams){
        let r = pluginParams.getParam("r");
        let b = pluginParams.getParam("b");
        let c = pluginParams.getParam("c");
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
                let weight = mitchell(p.x/r[0],b,c)
                    *mitchell(p.y/r[1],b,c)+'';
                if(!weight.includes('.')) weight+='.0';
                result += weight;
                if(offset<length-1) result+=',';
                else result+=');';
            }
        }

        return result;
    }
}

export {Mitchell_param};