import { useEffect } from "react";
import useGemini from "./calls/callgemini";
import { categories } from "./types";
import React from "react";
import { Button, IconButton } from "@mui/material";

//  const [rows, setRows] = React.useState<[]>([]);
//   const fetchGemini = async () => {
//     setRows(data?.response ?? []);
//   };
//   useEffect(() => {
//     fetchGemini();
//   }, []);

export default function Chat() {

    // function generateImage(imageUpload: HTMLInputElement) {
    //     const file = imageUpload.target.files[0];
    //         if (file) {
    //             const reader = new FileReader();
    //             reader.onload = (e) => {
    //                 imageBase64 = e.target.result.split(',')[1];
    //                 imagePreview.src = e.target.result;
    //                 previewContainer.style.display = 'block';
    //             };
    //             reader.readAsDataURL(file);
    //         } else {
    //             imageBase64 = null;
    //             imagePreview.src = '#';
    //             previewContainer.style.display = 'none';
    //         }
    //     });
    // }
   

    return (<div id="user_input">
        <form action="/upload" method="post" id="form" className="forms" encType="multipart/form-data">
            <button id="cut">&#10006;</button>
            <div className="inp">
                <label htmlFor="Category">Category:</label>
                <select id="category" name="category" defaultValue="Select Category">
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>
            <div className="inp">
                <label htmlFor="des">What are you looking for?:</label>
                <input type="text" id="prompt" placeholder="Add Description" required />
            </div>
            <div className="inp">
                <label>Min Price: Rs.<span id="minVal">5000</span></label><br />
                <input type="range" name="minRange" id="minRange" min="100" max="100000" step="50" value="5000" required /><br />

                <label>Max Price: Rs.<span id="maxVal">10000</span></label><br />
                <input type="range" name="maxRange" id="maxRange" min="100" max="100000" step="50" value="10000" required /><br />
            </div>
            <div className="inp">
                <label htmlFor="image">Image:</label>
                <input name="image_data" type="file" id="imageUpload" required />
            </div>

            <div className="feature">
                <input
                    type="submit"
                    id="sub"
                    onClick={(e) => {
                        e.preventDefault();
                        const promptInput = document.getElementById('prompt') as HTMLInputElement;
                        const categoryInput = document.getElementById('category') as HTMLInputElement;

                        const imageUpload = document.getElementById('imageUpload') as HTMLInputElement;
                        const minRange = document.getElementById('minRange') as HTMLInputElement;
                        const maxRange = document.getElementById('maxRange') as HTMLInputElement;
                        // const errorMessage = document.getElementById('errorMessage');
                        // const imagePreview = document.getElementById('imagePreview');
                        // const previewContainer = document.getElementById('previewContainer');
                        // alert('Form submitted!' + promptInput.value.trim()+minRange.value + maxRange.value + categoryInput.value);

                    }}
                />
            </div >
            
        </form>
    </div>
    );
}