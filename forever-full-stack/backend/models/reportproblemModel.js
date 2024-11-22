import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reporterName: {
    type: String,
    required: [true, "กรุณาระบุชื่อผู้แจ้งปัญหา"],
  },
  problemImage: {
    type: String,
    required: [true, "กรุณาแนบรูปภาพปัญหา"],
  },
  description: {
    type: String,
    required: [true, "กรุณาระบุรายละเอียดปัญหา"],
  },
  reportedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["รอรับเรื่อง", "รับเรื่องแล้ว", "กำลังดำเนินการ", "แก้ไขเสร็จสิ้น"],
    default: "รอรับเรื่อง",
  },
});

export default mongoose.model("ReportProblem", reportSchema);
