class Hex{
    /** 将字串符转换为 HEX 
     * @function
     * @param {string} text - 输入目标文本
     * @returns {string} 返回 HEX
     */
    static StringToHex(text){
        if(text.length == 0){
            return "";
        }

        let hex = "";
        for(let i = 0; i < text.length; i++){
            hex = hex + text.charCodeAt(i).toString(16).padStart(2, "0")
        }
        return hex;
    }
    static StrToHex = this.StringToHex;
    static ToHex = this.StringToHex;

    /** 截取指定位置的 HEX
     * @function
     * @param {string} hex - HEX 数据
     * @param {number} start - 截取开始位置
     * @param {number} length - 截取长度
     * @returns 返回已截取的 HEX
     */
    static SubHex(hex, start, length){
        if(hex == null || hex.length == 0){
            return;
        }
        if((start * 2) > hex.length || (start * 2) + (length * 2) > hex.length){
            throw new Error("已超出所要截取 HEX 的范围");
        }

        let output = "";
        for(let i = (start * 2); i < (start * 2) + (length * 2); i++){
            output = output + hex[i];
        }

        return output;
    }
    
    /** 转换为 Int, 小端序 */
    static ParseIntLo(hex){
        let length = hex.length;
        if(hex == null || length == 0){
            return 0;
        }
        else if(length > 8){
            return 2147483647
        }
        //长度不够补 0
        else if(length < 8){
            for(let i = 0; i < 8 - length; i++){
                hex = hex + "0";
            }
        }

        let hex2 = ""
        for (let i = 6; i > -1; i = i - 2) {
            hex2 = hex2 + hex[i] + hex[i + 1];
        }

        return parseInt(hex2, 16);
    }

    /** 转换为 Int, 大端序 */
    static ParseIntBo(hex){
        let length = hex.length;
        if(hex == null || length == 0){
            return 0;
        }
        else if(length > 8){
            return 2147483647
        }
        //长度不够补 0
        else if(length < 8){
            for(let i = 0; i < 8 - length; i++){
                hex = hex + "0";
            }
        }
        
        return parseInt(hex, 16);
    }
}

window.Hex = Hex;