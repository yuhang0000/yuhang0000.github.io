class Zip{

    //压缩包Zip格式详析: https://www.cnblogs.com/li-sx/p/17531186.html

    //属性
    static ver = "0.0.1.0803";
    static Version = this.ver;

    /** 解壓 
     * @class
     * */ 
    static Decode = class{
        /** 中央目录记录尾部区 */
        ECDR = new Zip.ECDR();
        /** 是压缩包吗 */
        IsZip = false;

        //构造函数
        constructor(data){
            if(data == null || data.length < 8){
                return;
            }

            //先检查中央目录记录尾部区
            for(let i = data.length - 8; i > -1; i = i - 2){
                let magicnum = "";
                //拼好魔数
                magicnum = window.Hex.SubHex(data, i / 2, 4);
                if(magicnum == "504b0506"){
                    if(window.Debug == true){
                        debugger;
                    }
                    
                    //检查中央目录记录尾部区
                    //检查是否越界
                    if(i + 44 > data.length){
                        throw new Error("不是一个有效的压缩包文件");
                    }
                    i = i + 8;
                    this.ECDR.DiskNo = window.Hex.ParseIntLo(window.Hex.SubHex(data, i / 2, 2));
                    i = i + 4;
                    this.ECDR.DiskNoOnStart = window.Hex.ParseIntLo(window.Hex.SubHex(data, i / 2, 2));
                    i = i + 4;
                    this.ECDR.CDRCountOnDisk = window.Hex.ParseIntLo(window.Hex.SubHex(data, i / 2, 2));
                    i = i + 4;
                    this.ECDR.CDRCount = window.Hex.ParseIntLo(window.Hex.SubHex(data, i / 2, 2));
                    i = i + 4;
                    this.ECDR.CDRLength = window.Hex.ParseIntLo(window.Hex.SubHex(data, i / 2, 4));
                    i = i + 8;
                    this.ECDR.CDROffset = window.Hex.ParseIntLo(window.Hex.SubHex(data, i / 2, 4));
                    i = i + 8;
                    this.ECDR.NodeLength = window.Hex.ParseIntLo(window.Hex.SubHex(data, i / 2, 2));
                    i = i + 4;
                    this.ECDR.Node = window.Hex.SubHex(data, i / 2, this.ECDR.NodeLength);
                    i = i + this.ECDR.NodeLength;
                    this.IsZip = true;
                    break;
                }
            }
        }
    }
    
    /** 中央目录记录尾部区 
     * @class
     */
    static ECDR = class{
        /** 当前磁盘编号 */
        DiskNo;
        /** 中央目录开始位置的磁盘编号 */
        DiskNoOnStart;
        /** 该磁盘上所记录的中央目录数量 */
        CDRCountOnDisk;
        /** 中央目录结构总数 */
        CDRCount;
        /** 中央目录的大小 */
        CDRLength;
        /** 中央目录开始位置相对位移 */
        CDROffset;
        /** 注释长度 */
        NodeLength;
        /** 注释内容 */
        Node;
    }

    /** 数据区 
     * @class
     */
    static DataBlock = class{
        /** 解压文件所需版本 */
        Version;
        /** 通用位标记：0:加密标志，3:数据描述标志 */
        Flags;
        /** 压缩方式 */
        ZipType;
        /** 文件最后修改时间 */
        LastEditDate;
        /** 文件最后修改日期 */
        LastEditTime;
        /** CRC-32校验码 */
        CRC32;
        /** 未压缩的大小 */
        SizeBefore;
        /** 压缩后的大小 */
        SizeAfter;
        /** 文件名长度 */
        FileNameLength;
        /** 扩展区长度 */
        ExBlockLength;
        /** 文件名 */
        FileName;
        /** 拓展区 */
        ExBlock;
    }
}

window.Zip = Zip;

//前置文件
if(window.Hex == null){
    console.warn("缺少前置文件: Hex.js ");
}