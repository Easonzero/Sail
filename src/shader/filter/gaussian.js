/**
 * Created by eason on 1/26/18.
 */
function gaussian(d,expv,alpha){
    return Math.max(0.0, Math.exp(-alpha * d * d) - expv);
}

function Gaussian_param(windowWidth){

    return function(pluginParams){
        let r = pluginParams.getParam("r");
        let alpha = pluginParams.getParam("alpha")[0];
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
                let expx = Math.exp(-alpha*r[0]*r[0]),expy = Math.exp(-alpha*r[1]*r[1]);
                let weight = gaussian(p.x,expx,alpha)*gaussian(p.y,expy,alpha)+'';
                if(!weight.includes('.')) weight+='.0';
                result += weight;
                if(offset<length-1) result+=',';
                else result+=');';
            }
        }

        return result;
    }
}

export {Gaussian_param};