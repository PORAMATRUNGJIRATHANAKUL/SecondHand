import { useState, useRef, useContext } from "react";
import { PencilIcon, CheckIcon } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);

  const [newImageFile, setNewImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

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
    const response = await updateUserProfile(newName);
    if (!response.success) {
      throw new Error("Failed to update profile");
    }
  };

  const updateProfileImage = async () => {
    const formData = new FormData();
    formData.append("profileImage", newImageFile);
    formData.append("userId", user._id);
    const response = await updateUserProfileImage(formData);
    if (!response.success) {
      throw new Error("Failed to update profile image");
    }
  };

  const updateProfile = async () => {
    setIsLoading(true);
    try {
      const updatePromises = [];

      if (newImageFile) {
        updatePromises.push(updateProfileImage());
      }
      if (newName !== user.name) {
        updatePromises.push(updateProfileName());
      }

      await Promise.all(updatePromises);

      const updatedUser = await fetchUserProfile();
      if (updatedUser) {
        setUser(updatedUser);
        setNewName(updatedUser.name);
        setImageTimestamp(Date.now());
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsEditing(false);
      setIsLoading(false);
      setPreviewImage(null);
      setNewImageFile(null);
    }
  };

  if (!user || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center mb-6">
        <img
          src={previewImage || `${user?.profileImage}?t=${imageTimestamp}`}
          alt="Profile"
          className="w-32 h-32 rounded-full mb-4 cursor-pointer"
          onClick={handleImageClick}
        />
        {isEditing && (
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        )}
        <button
          onClick={isEditing ? updateProfile : handleEdit}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isEditing ? (
            <>
              <CheckIcon className="w-4 h-4 mr-2" />
              Save
            </>
          ) : (
            <>
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit Profile
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
            Name
          </label>
          <input
            type="text"
            id="name"
            value={isEditing ? newName : user?.name}
            onChange={(e) => setNewName(e.target.value)}
            disabled={!isEditing}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={user?.email}
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
