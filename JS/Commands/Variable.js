/** 變數 
* @class
*/
export default class Variable{

    /** 獲取變數類型 
     * @function
     * @param {object} obj - 變數
     * @returns {string} 返回變量類型
     */
    static GetType(obj){
        if(obj == null){
            return "null";
        }
        let type = Object.prototype.toString.call(obj);
        return type.substring(8, type.length - 1).toLowerCase();
    }
    
}