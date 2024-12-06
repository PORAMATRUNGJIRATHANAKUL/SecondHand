import { useState, useRef, useContext } from "react";
import { PencilIcon, CheckIcon, Crown } from "lucide-react";
import { ShopContext } from "../context/ShopContext";

function ProfilePage() {
  const {
    user,
    fetchUserProfile,
    updateUserProfileImage,
    updateUserProfile,
    setUser,
  } = useContext(ShopContext);
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [newName, setNewName] = useState(user?.name || "");
  const [newUsername, setNewUsername] = useState(user?.displayName || "");
  const [newBankName, setNewBankName] = useState(user?.bankName || "");
  const [newBankAccount, setNewBankAccount] = useState(user?.bankAccount || "");
  const [newBankAccountName, setNewBankAccountName] = useState(
    user?.bankAccountName || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const [newImageFile, setNewImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

  const isVerifiedSeller =
    user?.bankAccount && user?.bankAccountName && user?.bankName;

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfileName = async () => {
    const response = await updateUserProfile(
      newName,
      newUsername,
      newBankName,
      newBankAccount,
      newBankAccountName
    );
    if (!response.success) {
      throw new Error("ไม่สามารถอัพเดทโปรไฟล์ได้");
    }
  };

  const updateProfileImage = async () => {
    const formData = new FormData();
    formData.append("profileImage", newImageFile);
    formData.append("userId", user._id);
    const response = await updateUserProfileImage(formData);
    if (!response.success) {
      throw new Error("ไม่สามารถอัพเดทรูปโปรไฟล์ได้");
    }
  };

  const updateProfile = async () => {
    setIsLoading(true);
    try {
      const updatePromises = [];

      if (newImageFile) {
        updatePromises.push(updateProfileImage());
      }
      if (newName !== user.name || newUsername !== user.username) {
        updatePromises.push(updateProfileName());
      }

      await Promise.all(updatePromises);

      const updatedUser = await fetchUserProfile();
      if (updatedUser) {
        setUser(updatedUser);
        setNewName(updatedUser.name);
        setNewUsername(updatedUser.username);
        setImageTimestamp(Date.now());
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัพเดทโปรไฟล์:", error);
      // แสดงข้อความแจ้งเตือนความผิดพลาด
    } finally {
      setIsEditing(false);
      setIsLoading(false);
      setPreviewImage(null);
      setNewImageFile(null);
    }
  };

  if (!user || isLoading) {
    return <div>กำลังโหลด...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <img
            src={previewImage || `${user?.profileImage}?t=${imageTimestamp}`}
            alt="รูปโปรไฟล์"
            className="w-32 h-32 rounded-full mb-4 cursor-pointer"
            onClick={handleImageClick}
            title={isEditing ? "คลิกเพื่อเปลี่ยนรูปโปรไฟล์" : ""}
          />
          {isVerifiedSeller && (
            <Crown
              className="absolute top-0 right-0 w-8 h-8 text-yellow-500"
              title="ร้านค้าที่ยืนยันแล้ว"
            />
          )}
        </div>
        {isEditing && (
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
            aria-label="อัพโหลดรูปโปรไฟล์"
          />
        )}
        <button
          onClick={isEditing ? updateProfile : handleEdit}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isEditing ? (
            <>
              <CheckIcon className="w-4 h-4 mr-2" />
              บันทึก
            </>
          ) : (
            <>
              <PencilIcon className="w-4 h-4 mr-2" />
              แก้ไขโปรไฟล์
            </>
          )}
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            ชื่อร้าน/ชื่อผู้ใช้
          </label>
          <input
            type="text"
            id="name"
            value={isEditing ? newName : user?.name}
            onChange={(e) => setNewName(e.target.value)}
            disabled={!isEditing}
            placeholder="กรุณากรอกชื่อร้าน/ชื่อผู้ใช้"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            ชื่อผู้ใช้
          </label>
          <input
            type="text"
            id="username"
            value={isEditing ? newUsername : user?.displayName}
            onChange={(e) => setNewUsername(e.target.value)}
            disabled={!isEditing}
            placeholder="กรุณากรอกชื่อผู้ใช้"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            อีเมล
          </label>
          <input
            type="email"
            id="email"
            value={user?.email}
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="bankName"
            className="block text-sm font-medium text-gray-700"
          >
            ชื่อธนาคาร
          </label>
          <input
            type="text"
            id="bankName"
            value={isEditing ? newBankName : user?.bankName}
            onChange={(e) => setNewBankName(e.target.value)}
            disabled={!isEditing}
            placeholder="กรุณากรอกชื่อธนาคาร"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        <div>
          <label
            htmlFor="bankAccount"
            className="block text-sm font-medium text-gray-700"
          >
            เลขบัญชีธนาคาร
          </label>
          <input
            type="text"
            id="bankAccount"
            value={isEditing ? newBankAccount : user?.bankAccount}
            onChange={(e) => setNewBankAccount(e.target.value)}
            disabled={!isEditing}
            placeholder="กรุณากรอกเลขบัญชีธนาคาร"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        <div>
          <label
            htmlFor="bankAccountName"
            className="block text-sm font-medium text-gray-700"
          >
            ชื่อบัญชี
          </label>
          <input
            type="text"
            id="bankAccountName"
            value={isEditing ? newBankAccountName : user?.bankAccountName}
            onChange={(e) => setNewBankAccountName(e.target.value)}
            disabled={!isEditing}
            placeholder="กรุณากรอกชื่อบัญชี"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
