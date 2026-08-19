import Hex from "./Hex.js";

export default class Zip{
    //压缩包Zip格式详析: https://www.cnblogs.com/li-sx/p/17531186.html

    //属性
    static ver = "0.0.3.0820";
    static Version = this.ver;

    /** 解壓 
     * @class
     * */ 
    static Decode = class{
        /** 中央目录记录尾部区 */
        ECDR = new Zip.ECDR();
        /** 是压缩包吗 */
        IsZip = false;
        /** 是否加密 */
        IsEnc = false;
        /** 文本编码 */
        TextEncode;
        /** 中央目录记录区队列 */
        CDRs = [];

        /** 解析压缩包, 构造函数 
         * @function
         * @param {Uint8Array} data - 二进制数据
         * @param {string} TextEncode - 指定文本编码
         */
        constructor(data, TextEncode = "UTF-8"){
            if(data == null || data.length < 4){
                return;
            }
            this.TextEncode = TextEncode;

            //先检查中央目录记录尾部区
            for(let i = data.length - 4; i > -1; i--){
                let magicnum;
                //拼好魔数
                magicnum = Hex.SubHex(data, i, 4);
                if(Hex.ParseUintLo(magicnum) == 101010256){ //50 4B 05 06
                    if(window.Debug == true){
                        debugger;
                    }
                    
                    //检查中央目录记录尾部区
                    //检查是否越界
                    if(i + 22 > data.length){
                        throw new Error("不是一个有效的压缩包文件. ");
                    }
                    i = i + 4;
                    this.ECDR.DiskNo = Hex.ParseUintLo(Hex.SubHex(data, i, 2));
                    i = i + 2;
                    this.ECDR.DiskNoOnStart = Hex.ParseUintLo(Hex.SubHex(data, i, 2));
                    i = i + 2;
                    this.ECDR.CDRCountOnDisk = Hex.ParseUintLo(Hex.SubHex(data, i, 2));
                    i = i + 2;
                    this.ECDR.CDRCount = Hex.ParseUintLo(Hex.SubHex(data, i, 2));
                    i = i + 2;
                    this.ECDR.CDRLength = Hex.ParseUintLo(Hex.SubHex(data, i, 4));
                    i = i + 4;
                    this.ECDR.CDROffset = Hex.ParseUintLo(Hex.SubHex(data, i, 4));
                    i = i + 4;
                    this.ECDR.NodeLength = Hex.ParseUintLo(Hex.SubHex(data, i, 2));
                    i = i + 2;
                    this.ECDR.Node = Hex.SubHex(data, i, this.ECDR.NodeLength);
                    i = i + this.ECDR.NodeLength;
                    this.IsZip = true;
                    break;
                }
            }

            //遍历中央目录记录区
            if(this.IsZip == true){
                if(this.ECDR.CDROffset - 22 > data.length){
                    throw new Error("中央目录记录区偏移量超出索引范围. ");
                }
                
                for(let i = this.ECDR.CDROffset; i < data.length; i){
                    let magicnum;
                    let textencode2 = this.TextEncode;
                    //拼好魔数
                    magicnum = Hex.SubHex(data, i, 4);
                    if(Hex.ParseUintLo(magicnum) == 33639248){ //50 4B 01 02
                        let cdr = new Zip.CDR;
                        i = i + 4;
                        cdr.VersionFormComp = Hex.SubHex(data, i, 2);
                        cdr.OS = Hex.ParseUintLo(new Uint8Array([cdr.VersionFormComp[1]]));
                        cdr.VersionFormComp = Hex.ParseUintLo(new Uint8Array([cdr.VersionFormComp[0]]));
                        i = i + 2;
                        cdr.VersionFormDecomp = Hex.ToBin(Hex.SubHex(data, i, 2));
                        cdr.FuncVer = Hex.ParseUintLo(new Uint8Array([cdr.VersionFormDecomp[0]]));
                        i = i + 2;
                        cdr.Flags = Hex.GetBitFlags(Hex.SubHex(data, i, 2));

                        //检查标识位
                        // https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
                        if(cdr.Flags[0] == true){ //加密
                            this.IsEnc = true;
                            cdr.NeedPW = true;
                        }
                        if(cdr.Flags[11] == true){
                            textencode2 = "UTF-8"
                        }

                        i = i + 2;
                        cdr.ZipType = Hex.ParseUintLo(Hex.SubHex(data, i, 2));
                        i = i + 2;
                        cdr.LastEditTime = Hex.SubHex(data, i, 2);
                        i = i + 2;
                        cdr.LastEditDate = Hex.SubHex(data, i, 2);
                        i = i + 2;
                        cdr.CRC32 = Hex.ParseUintLo(Hex.SubHex(data, i, 4));
                        i = i + 4;
                        cdr.SizeAfter = Hex.ParseUintLo(Hex.SubHex(data, i, 4));
                        i = i + 4;
                        cdr.SizeBefore = Hex.ParseUintLo(Hex.SubHex(data, i, 4));
                        i = i + 4;
                        cdr.FileNameLength = Hex.ParseUintLo(Hex.SubHex(data, i, 2));
                        i = i + 2;
                        cdr.ExBlockLength = Hex.ParseUintLo(Hex.SubHex(data, i, 2));
                        i = i + 2;
                        cdr.NoteLength = Hex.ParseUintLo(Hex.SubHex(data, i, 2));
                        i = i + 2;
                        cdr.FileFormDisk = Hex.ParseUintLo(Hex.SubHex(data, i, 2));
                        i = i + 2;
                        cdr.IntFileAttr = Hex.GetBitFlags(Hex.SubHex(data, i, 2));
                        i = i + 2;
                        cdr.ExtFileAttr = Hex.GetBitFlags((Hex.SubHex(data, i, 4)));
                        
                        //文件属性
                        cdr.FileAttr = new Zip.FileAttr;
                        switch (cdr.OS){
                            case 0: //MSDOS
                                cdr.FileAttr.ReadOnly = cdr.ExtFileAttr[0];
                                cdr.FileAttr.Hiddle = cdr.ExtFileAttr[1];
                                cdr.FileAttr.System = cdr.ExtFileAttr[2];
                                cdr.FileAttr.SymbLink = cdr.ExtFileAttr[3];
                                cdr.FileAttr.Directory = cdr.ExtFileAttr[4];
                                cdr.FileAttr.Archive = cdr.ExtFileAttr[5];
                                cdr.FileAttr.Device = cdr.ExtFileAttr[6];
                                cdr.FileAttr.Normal = cdr.ExtFileAttr[7];
                                break;
                            case 10: //WinNTFS
                                cdr.FileAttr.ReadOnly = cdr.ExtFileAttr[0];
                                cdr.FileAttr.Hiddle = cdr.ExtFileAttr[1];
                                cdr.FileAttr.System = cdr.ExtFileAttr[2];
                                cdr.FileAttr.SymbLink = cdr.ExtFileAttr[3];
                                cdr.FileAttr.Directory = cdr.ExtFileAttr[4];
                                cdr.FileAttr.Archive = cdr.ExtFileAttr[5];
                                cdr.FileAttr.Device = cdr.ExtFileAttr[6];
                                cdr.FileAttr.Normal = cdr.ExtFileAttr[7];
                                break;
                            default:
                                console.warn("暂不受支持的作业系统: " + cdr.OS);
                                cdr.FileAttr.ReadOnly = cdr.ExtFileAttr[0];
                                cdr.FileAttr.Hiddle = cdr.ExtFileAttr[1];
                                cdr.FileAttr.System = cdr.ExtFileAttr[2];
                                cdr.FileAttr.SymbLink = cdr.ExtFileAttr[3];
                                cdr.FileAttr.Directory = cdr.ExtFileAttr[4];
                                cdr.FileAttr.Archive = cdr.ExtFileAttr[5];
                                cdr.FileAttr.Device = cdr.ExtFileAttr[6];
                                cdr.FileAttr.Normal = cdr.ExtFileAttr[7];
                                break;
                        }

                        i = i + 4;
                        cdr.FileOffset = Hex.ParseUintLo(Hex.SubHex(data, i, 4));
                        i = i + 4;
                        cdr.FileName = Hex.HexToStr(Hex.SubHex(data, i, cdr.FileNameLength), textencode2);
                        i = i + cdr.FileNameLength;
                        cdr.ExBlock = Hex.SubHex(data, i, cdr.ExBlockLength);
                        i = i + cdr.ExBlockLength;
                        cdr.Node = Hex.HexToStr(Hex.SubHex(data, i, cdr.NodeLength), textencode2);
                        i = i + cdr.NoteLength;

                        this.CDRs.push(cdr);
                    }
                    else{
                        break;
                    }
                }
            }

            this.ECDR.Node = Hex.HexToStr(this.ECDR.Node, this.TextEncode);
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

    /** 中央目录记录区 
     * @class
     */
    static CDR = class{
        /** 压缩所用版本 */
        VersionFormComp;
        /** 解压所需版本 */
        VersionFormDecomp;
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
        /** 文件注释长度 */
        NoteLength;
        /** 文件开始位置的磁盘编号 */
        FileFormDisk;
        /** 内部文件属性 */
        IntFileAttr;
        /** 外部文件属性 */
        ExtFileAttr;
        /** 本地文件头的相对偏移 */
        FileOffset;
        /** 文件名 */
        FileName;
        /** 拓展区 */
        ExBlock;
        /** 文件注释 */
        Note;

        /** 对应系统 */
        OS;
        /** 功能版本定义 */
        FuncVer;
        /** 是否需要密码 */
        NeedPW;
        /** 文本编码格式 */
        TextEncode;
        /** 文件属性 */
        FileAttr;
    }

    /** 作业系统类型 
     * @class
     */
    static OSType = class{
        static MSDOS = 0;
        static Amiga = 1;
        static OpenVMS = 2;
        static UNIX = 3;
        static VM_CMS = 4;
        static Atari_ST = 5;
        static OS_2 = 6;
        static Macintosh = 7;
        static Z_System = 8;
        static CP_M = 9;
        static Windows_NTFS = 10;
        static MVS = 11;
        static VSE = 12;
        static Acorn_Risc = 13;
        static VFAT = 14;
        static alternate_MVS = 15;
        static BeOS = 16;
        static Tandem = 17;
        static OS_400 = 18;
        static OS_X = 19;
    }

    /** 文件属性 */
    static FileAttr = class{
        /** 默认文件属性 */
        static Normal = false;
        /** 只读 */
        static ReadOnly = false;
        /** 颖仓 */
        static Hiddle = false;
        /** 系统文件 */
        static System = false;
        /** 这是文件夹 */
        static Directory = false;
        /** 归档 */
        static Archive = false;
        /** 符号文件/软链接 */
        static SymbLink = false;
        /** 设备 */
        static Device = false;
    }

}
