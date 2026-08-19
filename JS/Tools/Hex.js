import Variable from "../Commands/Variable.js";

export default class Hex{
    /** 将字串符转换为 HEX 
     * @function
     * @param {string} text - 输入目标文本
     * @param {string} encode - 文本编码
     * @returns {Uint8Array} 返回 HEX
     */
    static StringToHex(text, encode = "UTF-8"){
        /*if(text == null){
            return null;
        }
        if(text.length == 0){
            return new Uint8Array(0);
        }

        let hex = [];
        for(let i = 0; i < text.length; i++){
            hex.push(text.charCodeAt(i).toString(16).padStart(2, "0"));
        }
        return new Uint8Array(hex);*/
        
        //居然有现成的方案
        if(Variable.GetType(text) != "string"){
            throw new Error("不是一个有效的字串符. ");
        }
        let te = new TextEncoder(encode);
        return te.encode(text);
    }
    static StrToHex = this.StringToHex;
    static ToHex = this.StringToHex;

    /** 将 HEX 转换为字串符 
     * @function
     * @param {Uint8Array} hex - Hex 对象
     * @param {string} encode - 文本编码
     * @returns {string} 返回字串符 
     */
    static HexToString(hex, encode = "UTF-8"){
        /*if(hex == null){
            return null;
        }
        hex = hex.trim();
        if(hex.length == 0){
            return "";
        }*/
        if(hex == null){
            return null;
        }
        if(Variable.GetType(hex) != "uint8array"){
            throw new Error("不是一个有效的位元数组. ");
        }
        let tdec = new TextDecoder(encode);
        return tdec.decode(hex);
    }
    static HexToStr = this.HexToString;
    static toString = this.HexToString;

    /** 截取指定位置的 HEX
     * @function
     * @param {Uint8Array} hex - HEX 数据
     * @param {number} start - 截取开始位置
     * @param {number} length - 截取长度
     * @returns {Uint8Array} 返回已截取的 HEX
     */
    static SubHex(hex, start, length){
        if(hex == null || hex.length == 0){
            return null;
        }
        if(start > hex.length || (start + length) > hex.length || start < 0 || length < 0){
            throw new Error("已超出所要截取 HEX 的范围");
        }

        let output = [];
        for(let i = start; i < (start + length); i++){
            output.push( hex[i] );
        }

        return new Uint8Array(output);
    }
    
    //大端序从左到右, 小端序从右至左

    /** 转换为 Uint, 大端序 
     * @function
     * @param {Uint8Array} hex - HEX 对象
     * @returns {number} 返回 Int
     */
    static ParseUintHo(hex){
        if(hex == null){
            return null;
        }
        if(Variable.GetType(hex) != "uint8array"){
            throw new Error("不是一个有效的位元数组. ");
        }
        if(hex.length == 0){
            return 0;
        }
        if(hex.length > 4){
            throw new Error("位元组超出 int 上限。 ");
        }

        let num = 0;

        for(let i = hex.length - 1; i > -1; i--){
            num = num + (hex[i] * Math.pow(16, i * 2));
        }

        return num;

    }
    
    /** 转换为 Int, 大端序 
     * @function
     * @param {Uint8Array} hex - HEX 对象
     * @returns {number} 返回 Int
     */
    static ParseIntHo(hex){
        if(hex == null){
            return null;
        }
        if(Variable.GetType(hex) != "uint8array"){
            throw new Error("不是一个有效的位元数组. ");
        }
        if(hex.length == 0){
            return 0;
        }
        if(hex.length > 4){
            throw new Error("位元组超出 int 上限。 ");
        }

        let num = 0;

        for(let i = hex.length - 1; i > -1; i--){
            num = num + (hex[i] * Math.pow(16, i * 2));
        }

        if(num > 2147483647){
            num = num - 4294967296;
        }

        return num;

    }
    
    /** 转换为 Uint, 小端序 
     * @function
     * @param {Uint8Array} hex - HEX 对象
     * @returns {number} 返回 Int
     */
    static ParseUintLo(hex){
        // let length = hex.length;
        // if(hex == null || length == 0){
        //     return 0;
        // }
        // else if(length > 8){
        //     return 2147483647
        // }
        // //长度不够补 0
        // else if(length < 8){
        //     for(let i = 0; i < 8 - length; i++){
        //         hex = hex + "0";
        //     }
        // }

        // let hex2 = ""
        // for (let i = 6; i > -1; i = i - 2) {
        //     hex2 = hex2 + hex[i] + hex[i + 1];
        // }

        // return parseInt(hex2, 16);
        if(hex == null){
            return null;
        }
        if(Variable.GetType(hex) != "uint8array"){
            throw new Error("不是一个有效的位元数组. ");
        }
        if(hex.length == 0){
            return 0;
        }
        if(hex.length > 4){
            throw new Error("位元组超出 int 上限。 ");
        }

        let num = 0;

        for(let i = 0; i < hex.length; i++){
            num = num + (hex[i] * Math.pow(16, i * 2));
        }

        return num;

    }
    
    /** 转换为 Int, 小端序 
     * @function
     * @param {Uint8Array} hex - HEX 对象
     * @returns {number} 返回 Int
     */
    static ParseIntLo(hex){
        if(hex == null){
            return null;
        }
        if(Variable.GetType(hex) != "uint8array"){
            throw new Error("不是一个有效的位元数组. ");
        }
        if(hex.length == 0){
            return 0;
        }
        if(hex.length > 4){
            throw new Error("位元组超出 int 上限。 ");
        }

        let num = 0;

        for(let i = 0; i < hex.length; i++){
            num = num + (hex[i] * Math.pow(16, i * 2));
        }

        if(num > 2147483647){
            num = num - 4294967296;
        }

        return num;

    }

    //参考: [教你快速学会二进制、十进制、十六进制之间的转换](https://zhuanlan.zhihu.com/p/257162442)
    /** 转换为二进制 
     * @function
     * @param {Uint8Array} hex - HEX 对象
     * @param {boolean} BE - 大端序模式
     * @returns {array} 返回二进制数组
     */
    static HexToBin(hex, BE = false){
        if(hex == null){
            return null;
        }
        if(Variable.GetType(hex) != "uint8array"){
            throw new Error("不是一个有效的位元数组. ");
        }
        if(hex.length == 0){
            return [];
        }

        let array = [];

        //数组循环
        for(let i = hex.length - 1; i > -1; i--){
            let text = "";
            let num = hex[i];
            //十进制转二进制
            for(let ii = 0; ii < 8; ii++){
                text = (num%2).toString() + text;
                num = Math.trunc(num/2);
                if(num == 0){
                    break;
                }
            }
            //补个 0
            /*while(text.length < 8){
                text = "0" + text;
            }*/
            text = text.padStart(8, "0");
            array.push(text);
        }

        if(BE == true){
            array.reverse();
        }

        return array;
    }
    static ToBin = this.HexToBin;

    /** 二进制转换为 HEX  
     * @function
     * @param {array} array - 二进制数组
     * @param {boolean} BE - 大端序模式
     * @returns {Uint8Array} 返回 HEX 对象
     */
    static BinToHex(array, BE = false){
        if(array == null){
            throw new Error("不是一个有效的数组. ");
        }
        if(Variable.GetType(array) != "array"){
            //字串符拆分
            if(Variable.GetType(array) == "string"){
                let text = array;
                let textsub = "";
                array = [];
                let num = 0;
                for(let i = 0; i < text.length; i++){
                    textsub = textsub + text[i];
                    num++;
                    if(num == 8){
                        num = 0;
                        array.push(textsub);
                        textsub = "";
                    }
                }
                if(num > 0){
                    array.push(textsub);
                }
            }
            else{
                throw new Error("不是一个有效的数组. ");
            }
        }
        if(BE == false){
            array.reverse();
        }
        let arr = [];
        
        //便利
        for(let i = 0; i < array.length; i++){
            let text = array[i];
            let num = 0;
            if(text.length > 8){
                throw new Error("超出规定 BYTE 范围");
            }
            for(let ii = 0; ii < text.length; ii++){
                num = num + (parseInt(text[ii]) * Math.pow(2,text.length - 1 - ii));
            }
            arr.push(num);
        }
        
        return new Uint8Array(arr);
    }

    /** 获取位掩码 
     * @function
     * @param {Uint8Array} hex - HEX 对象
     * @param {boolean} BE - 大端序模式
     * @returns {Array} 返回布尔值数组
     */
    static GetBitFlags(hex, BE = false){
        if(hex == null || Variable.GetType(hex) != "uint8array"){
            throw new Error("不是一个有效的位元数组. ");
        }
        if(hex.length == 0){
            return [];
        }
        let array = [];

        let text = this.ToBin(hex, BE).join("");
        //位掩码是从右边开始的，从右往左数
        for(let i = text.length - 1; i > -1; i--){
            if(text[i] == "1"){
                array.push(true);
            }
            else{
                array.push(false);
            }
        }

        return array;
    }

}