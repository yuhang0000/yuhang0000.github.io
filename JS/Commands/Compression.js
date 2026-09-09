import Variable from "./Variable.js";
import Hex from "../Tools/Hex.js";

/** 压缩&解压缩算法 
 * @class
 */
export default class Compression{
    // 先定义一个字典 
    /** @typedef {Object} DecodeResult
     * @property {boolean} Status - 成功了吗
     * @property {string} Msg - 返回消息
     * @property {uint8array} Result - 已解码数据
     */

    /** Deflated 算法
     * @class
     */
    static Deflated = class{
        //https://blog.wuxhqi.com/deflate%e5%8e%8b%e7%bc%a9%e6%95%b0%e6%8d%ae%e6%a0%bc%e5%bc%8f%e6%b7%b1%e5%ba%a6%e8%a7%a3%e6%9e%90%ef%bc%9a%e4%bd%8d%e5%ba%8f%e3%80%81%e5%9d%97%e7%bb%93%e6%9e%84%e4%b8%8e%e6%89%8b%e5%8a%a8%e8%a7%a3/
        //https://www.rfc-editor.org/info/rfc1951/
        /** 解码
         * @function
         * @param {uint8array} data - 传递 Deflated 数据流
         * @returns {DecodeResult}
         */
        static Decode(data){
            /** 返回重载 */
            let result = {
                /** 成功了吗 */
                Status: false,
                /** 返回消息 */
                Msg: "OK. ",
                /** 已解码数据 */
                Result,
            }
            if(data == null){
                result.Msg = "不可传递空值. ";
                result.Result = null;
                return result;
            }
            if(Variable.GetType(data) != "uint8array"){
                result.Msg = "不是一个有效的位元数组. ";
                result.Result = null;
                return result;
            }
            if(data.length == 0){
                result.Status = true;
                result.Result = new uint8array([]);
                return result;
            }

            let BFINAL; //是否最后一个数据快
            let BTYPE; //类型 0: 无压缩, 1: 固定哈夫曼树, 2: 不是固定的哈夫曼树

            for(let i = 0; i < data.length; i++){
                let byte = Hex.HexToBin(data[i])
                if(byte[7] == "1"){
                    BFINAL = true;
                }
                else{
                    BFINAL = false;
                }
                BTYPE = Hex.BinToHex(byte[5] + byte[6]);
                

            }
        }
    }

}