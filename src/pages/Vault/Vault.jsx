import { useState, useEffect } from "react";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "../firebase";
import axios from "axios";
import Navbar from "../../components/Navbar.jsx";

function Vault({ thememode, toggle, user }) {
  const [fileUpload, setfileUpload] = useState(null);
  const [fileUrls, setfileUrls] = useState([]);

  const formatDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
    const time = now.toLocaleTimeString("en-GB", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    return `${date} ${time}`;
  };

  const uploadFile = () => {
    if (fileUpload === null) return;
    const formattedDateTime = formatDateTime();
    const fileName = `${fileUpload.name} - ${formattedDateTime}`;
    const fileRef = ref(storage, `files/${fileName}`);

    uploadBytes(fileRef, fileUpload).then(() => {
      getDownloadURL(fileRef).then((url) => {
        const addUrl = async () => {
          try {
            const res = await axios.post(
              `${process.env.REACT_APP_BASE_URL}/api/user/addUrl/${user._id}`,
              { url, fileName }
            );
            console.log("File URL:", res.data);
          } catch (err) {
            console.log(err);
          }
        };
        addUrl();
        setfileUrls((prev) => [...prev, { url, fileName }]);
      });
    });
  };

  const downloadCSV = async (fileName) => {
    const fileRef = ref(storage, `files/${fileName}`);
    const url = await getDownloadURL(fileRef);
    window.open(url, "_blank");
  };

  useEffect(() => {
    const getFiles = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/user/getUrls/${user._id}`
        );
        setfileUrls(res.data.files);
      } catch (err) {
        console.log(err);
      }
    };
    getFiles();
  }, [user._id]);  // ✅ added dependency

  const convertFileName = (filename) => {
    const strings = filename.split(" ");
    const k = new Date(strings[1]).toLocaleString();
    return { first: strings[0], second: k };
  };

  return (
    <div className="h-full" style={{ backgroundColor: thememode === 'dark' ? '#181818' : '#f0f0f0' }}>
      <Navbar thememode={thememode} toggle={toggle} />

      <div className="dark:text-white h-screen">
        <div className='font-extrabold text-2xl mx-4 mt-4 dark:text-[#f0f0f0]'>Storage Vault</div>
        <div className="flex justify-between">
          <div className='mx-4 text-gray-600 dark:text-gray-400'>
            Export Transaction data with filters of your choice and upload them here in the vault
          </div>
          <div className="flex justify-end mx-4">
            <label htmlFor="actual-btn" className="text-white rounded-md p-2 bg-[#000080] mx-1 cursor-pointer">
              Choose File
            </label>
            <input
              type="file"
              id="actual-btn"
              className="hidden"
              onChange={(event) => { setfileUpload(event.target.files[0]); }}
            />
            <button onClick={uploadFile} className="text-white rounded-md p-2 bg-[#000080]">
              Upload
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 dark:bg-[#181818] m-4">
          {fileUrls.map((file) => {
            const { first, second } = convertFileName(file.fileName);
            return (
              <div key={file.fileName}>
                <div
                  className="m-2 max-w-[400px] h-[100px] rounded-md shadow-md font-semibold px-2 py-2 border border-dashed flex items-center justify-center cursor-pointer"
                  style={{
                    color: thememode === "dark" ? "white" : "black",       // ✅ ===
                    backgroundColor: thememode === "dark" ? "#282828" : "white",  // ✅ ===
                    borderColor: thememode === "dark" ? "white" : "black",
                  }}
                  onClick={() => downloadCSV(file.fileName)}
                >
                  <img src="folder.png" className="h-20 w-20" alt="Folder" />  {/* ✅ removed 'icon' from alt */}
                  <div className="p-3">
                    <div className="font-bold">{first}</div>
                    <div className="text-sm">{second}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Vault;