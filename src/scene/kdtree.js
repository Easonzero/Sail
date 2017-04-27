/**
 * Created by eason on 17-4-18.
 */
class KDNode{
    constructor(e,split){
        this.e = e;
        this.split = split;
    }
}

class KDTree{
    constructor(data){

    }

    generateNode(pIndex,data){
         if(data = []) {
             return;
         }


    }

    getSplit(data){
        let variance;//方差
        let sum=0,sum2=0;
        let i=0,len=a.length;
        for(;i<len;i++){
            sum+=data[i];
            sum2+=data[i]*data[i];
        }
        variance=sum2/len-(sum/len)*(sum/len);
    }
}