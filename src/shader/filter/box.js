/**
 * Created by eason on 1/26/18.
 */
function box(p){
    return 1.0;
}

function Box_param(windowWidth){

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
                  x:(j + 0.5) * r.x / windowWidth,
                  y:(i + 0.5) * r.y / windowWidth
                };
                let weight = box(p)+'';
                if(!weight.includes('.')) weight+='.0';
                result += weight;
                if(offset<length-1) result+=',';
                else result+=');';
            }
        }

        return result;
    }
}

export {Box_param};