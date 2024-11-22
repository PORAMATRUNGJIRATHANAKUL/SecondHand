const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reporterName: {
    type: String,
    required: [true, "กรุณาระบุชื่อผู้แจ้งปัญหา"],
  },
  problemImage: {
    type: String, // เก็บ URL ของรูปภาพ
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

module.exports = mongoose.model("ReportProblem", reportSchema);
