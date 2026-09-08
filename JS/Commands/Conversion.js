import Variable from "./Variable.js";
import Hex from "../Tools/Hex.js";

export default class Conversion{

    // https://img2023.cnblogs.com/blog/21774/202311/21774-20231110120033061-1649867627.png
    /** 转换时间, MSDOS 格式 
     * @function
     * @param {Uint8Array} date - 日期, 如果 time 缺省时, 为 4 位字节
     * @param {Uint8Array} time - 时间
     * @returns {date} 返回 Date 日期对象
     */
    static GetDateTimeFromMSDOS(date, time = null){
        if(date == null || Variable.GetType(date) != "uint8array"){
            throw new Error("不是一个有效的位元数组. ");
        }

        let year = 0;
        let month = 0;
        let day = 0;
        let hour = 0;
        let min = 0;
        let sec = 0;
        //日期时间分别在独立的 Uint8Array
        if(date.length != 4 && date.length == 2){
            if(time == null || Variable.GetType(time) != "uint8array"){
                throw new Error("不是一个有效的位元数组. ");
            }
            if(time.length != 2){
                throw new Error("位元数组长度不符合要求. ");
            }
            
            date = Hex.ToBin(date).join("");
            time = Hex.ToBin(time).join("");
            day = Hex.ParseUint(Hex.BinToHex(date.substring(11,16)), true);
            month = Hex.ParseUint(Hex.BinToHex(date.substring(7,11)), true);
            year = Hex.ParseUint(Hex.BinToHex(date.substring(0,7)), true);
            sec = Hex.ParseUint(Hex.BinToHex(time.substring(11,16)), true);
            min = Hex.ParseUint(Hex.BinToHex(time.substring(5,11)), true);
            hour = Hex.ParseUint(Hex.BinToHex(time.substring(0,5)), true);
        }
        //日期时间在同一个 Uint8Array
        else if(date.length == 4){
            date = Hex.ToBin(date, false).join("");
            day = Hex.ParseUint(Hex.BinToHex(date.substring(11,16)), true);
            month = Hex.ParseUint(Hex.BinToHex(date.substring(7,11)), true);
            year = Hex.ParseUint(Hex.BinToHex(date.substring(0,7)), true);
            sec = Hex.ParseUint(Hex.BinToHex(date.substring(27,32)), true);
            min = Hex.ParseUint(Hex.BinToHex(date.substring(21,27)), true);
            hour = Hex.ParseUint(Hex.BinToHex(date.substring(16,21)), true);
        }
        else{
            throw new Error("位元数组长度不符合要求. ");
        }

        return new Date(year + 1980, month - 1, day, hour, min, sec * 2, 0);
    }

    /** 修饰文件大小, 就是在数字后边加上 GB, MB, KB, B 
     * @function
     * @param {number} size - 文件大小
     * @returns {string} 修饰后的文件大小
     */
    static FixFileSize(size){
        if(size == null || Variable.GetType(size) != "number"){
            return "-1";
        }

        if(size < 1024){
            return size.toString() + " B";
        }
        else if(size < 1048576){
            return (size / 1024).toFixed(2) + " KB";
        }
        else if(size < 1073741824){
            return (size / 1048576).toFixed(2) + " MB";
        }
        else if(size < 1099511627776){
            return (size / 1073741824).toFixed(2) + " GB";
        }
        else if(size < 1125899906842624){
            return (size / 1099511627776).toFixed(2) + " TB";
        }
    }

    //type:0    2026-8-17 15:42:46
    //type:1    2026/8/17 15:42:46
    //type:2    2026-8-17
    //type:3    2026/8/17
    //type:4    15:42:46
    //type:5    2026年8月17日 15:42:46
    //type:6    2026年8月17日 星期天 15:42:46
    //default:  Mon Aug 17 2026 15:42:46 GMT+0800 (中国标准时间)
    /** 修饰时间格式
     * @function
     * @param {Date} date - Date 日期对象
     * @returns {string} 返回修饰好的时间文本
     */
    static FixDateTime(date = null, type = 0){
        if(date == null){
            date = new Date();
        }
        if(Variable.GetType(date) != "date"){
            throw new Error("不是一个有效的日期对象. ");
        }

        let year = date.getFullYear().toString();
        let month = (date.getMonth() + 1).toString();
        let day = date.getDate().toString();
        let hour = date.getHours().toString().padStart(2, "0");
        let min = date.getMinutes().toString().padStart(2, "0");
        let sec = date.getSeconds().toString().padStart(2, "0");
        let week = date.getDay();

        switch(type){
            case 0:
                return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
            case 1:
                return year + "/" + month + "/" + day + " " + hour + ":" + min + ":" + sec;
            case 2:
                return year + "-" + month + "-" + day
            case 3:
                return year + "/" + month + "/" + day;
            case 4:
                return hour + ":" + min + ":" + sec;
            case 5:
                return year + "年" + month + "月" + day + "日 " + hour + ":" + min + ":" + sec;
            case 6:
                let weekk
                switch(week){
                    case 1:
                        weekk = "一";
                        break;
                    case 2:
                        weekk = "二";
                        break;
                    case 3:
                        weekk = "三";
                        break;
                    case 4:
                        weekk = "四";
                        break;
                    case 5:
                        weekk = "五";
                        break;
                    case 6:
                        weekk = "六";
                        break;
                    default:
                        weekk = "天";
                        break;
                }
                return year + "年" + month + "月" + day + "日 星期" + weekk + " " + hour + ":" + min + ":" + sec;
            default:
                return date.toString();
        }
    }

}