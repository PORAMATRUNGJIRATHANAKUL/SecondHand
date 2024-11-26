import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: {
      type: String,
    },
    district: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{5}$/.test(v);
        },
        message: "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก",
      },
    },
    country: {
      type: String,
      required: true,
      default: "ประเทศไทย",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{9,10}$/.test(v);
        },
        message: "เบอร์โทรศัพท์ไม่ถูกต้อง",
      },
    },
  },
  {
    timestamps: true,
  }
);

// สร้าง index
addressSchema.index({ userId: 1 });
addressSchema.index({ userId: 1, isDefault: 1 });

// ทำให้แน่ใจว่ามีที่อยู่เริ่มต้นเพียงที่เดียวต่อผู้ใช้
addressSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

const Address = mongoose.model("Address", addressSchema);

export default Address;
