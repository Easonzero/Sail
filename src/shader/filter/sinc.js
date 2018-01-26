/**
 * Created by eason on 1/26/18.
 */
function sinc(x){
    x = Math.abs(x);
    if (x < 1e-5) return 1.0;
    return Math.sin(Math.PI * x) / (Math.PI * x);
}

function windowedSinc(x,radius,tau){
    x = Math.abs(x);
    if (x > radius) return 0.0;
    let lanczos = sinc(x / tau);
    return sinc(x) * lanczos;
}

function Sinc_param(windowWidth){

    return function(pluginParams){
        let r = pluginParams.getParam("r");
        let tau = pluginParams.getParam("tau");
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
                let weight = windowedSinc(p.x,r[0],tau)
                    *windowedSinc(p.y,r[1],tau)+'';
                if(!weight.includes('.')) weight+='.0';
                result += weight;
                if(offset<length-1) result+=',';
                else result+=');';
            }
        }

        return result;
    }
}

export {Sinc_param};