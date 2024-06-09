"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaUpload } from "react-icons/fa6";

export default function Home() {
	const [imageFile, setImageFile] = useState(null);
	const [imageUrl, setImageUrl] = useState(""); // State for URL input
	const [prediction, setPrediction] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [darkMode, setDarkMode] = useState(true); // Toggle dark mode

	const handleImageChange = (e) => {
		if (e.target.files && e.target.files.length > 0) {
			// File upload
			setImageFile(e.target.files[0]);
			setImageUrl(""); // Reset URL input
		} else {
			// URL input
			setImageUrl(e.target.value);
			setImageFile(null); // Reset file upload
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		// Check if an image is selected or URL is entered
		if (!imageFile && !imageUrl) {
			console.error("Please select an image or enter a URL.");
			setIsLoading(false);
			return;
		}

		let base64String = null;

		if (imageFile) {
			// File upload: Encode image to Base64
			const reader = new FileReader();
			reader.onloadend = () => {
				base64String = reader.result.split(",")[1]; // Extract base64 string
				sendImage(base64String);
			};
			reader.readAsDataURL(imageFile);
		} else {
			try {
				// URL input: Fetch image and encode to Base64
				const response = await fetch(imageUrl);
				const blob = await response.blob();
				const reader = new FileReader();
				reader.onloadend = () => {
					base64String = reader.result.split(",")[1]; // Extract base64 string
					setImageFile(blob); // Set imageFile to be displayed
					sendImage(base64String);
				};
				reader.readAsDataURL(blob);
			} catch (error) {
				console.error("Error:", error);
				setIsLoading(false);
			}
		}
	};

	const sendImage = async (base64String) => {
		try {
			// Send the fetch request to your server
			const response = await fetch("http://localhost:5000/predict", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ image: base64String }),
			});

			const data = await response.json();
			setPrediction(data.class);
		} catch (error) {
			console.error("Error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div
			className={`min-h-screen flex flex-col justify-between ${
				darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
			}`}
		>
			<header
				className={`bg-blue-500 py-4 ${
					darkMode ? "bg-gray-800" : "bg-blue-500"
				}`}
			>
				<div className="container mx-auto flex justify-between items-center">
					<h1 className="text-white text-2xl font-semibold">
						Sports Classification
					</h1>
					<button
						className="text-white text-sm px-2 py-1 rounded-md border border-transparent focus:outline-none"
						onClick={() => setDarkMode(!darkMode)}
					>
						{darkMode ? "Light Mode" : "Dark Mode"}
					</button>
				</div>
			</header>
			<motion.main
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="flex flex-col items-center justify-center flex-grow"
			>
				<form
					onSubmit={handleSubmit}
					className={`bg-white rounded-lg shadow-md p-8 w-[400px] mb-8 ${
						darkMode ? "dark:bg-gray-800" : ""
					}`}
				>
					<div className="mb-4 flex flex-col w-full items-center justify-center gap-4">
						{imageFile && (
							<img
								src={URL.createObjectURL(imageFile)}
								alt="Selected Image"
								className="w-32 h-32 object-cover rounded-md"
							/>
						)}
						<div className="flex items-center gap-4">
							<label htmlFor="image" className="block font-bold mb-2">
								Upload Image
							</label>
							<input
								type="file"
								id="image"
								accept="image/*"
								onChange={handleImageChange}
								className="hidden"
							/>
							<label
								htmlFor="image"
								className={`rounded-md transition-colors duration-300 ${
									darkMode
										? "focus:outline-none focus:ring-2 focus:ring-gray-500"
										: "focus:outline-none focus:ring-2 focus:ring-blue-500"
								}`}
							>
								<FaUpload size={30} />
							</label>
						</div>
						<p className="text-sm text-gray-300">OR</p>
						<div className="flex items-center gap-4 w-full">
							<label htmlFor="imageUrl" className="block font-bold mb-2">
								Enter Image URL
							</label>
							<input
								type="text"
								id="imageUrl"
								value={imageUrl}
								onChange={handleImageChange}
								className="text-black w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>
					<motion.button
						type="submit"
						disabled={isLoading || (!imageFile && !imageUrl)}
						className={`w-full px-4 py-2 rounded-md transition-colors duration-300 ${
							isLoading || (!imageFile && !imageUrl)
								? "bg-gray-400 cursor-not-allowed"
								: darkMode
								? "bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
								: "bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
						}`}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						{isLoading ? "Predicting..." : "Classify"}
					</motion.button>
				</form>
				{prediction && (
					<motion.div
						className={`bg-white rounded-lg shadow-md p-8 w-[400px] flex items-center justify-center flex-col ${
							darkMode ? "dark:bg-gray-800" : ""
						}`}
					>
						<h2 className="mb-4">Sports Category predicted by the model:</h2>
						<p className="font-bold">{prediction.toUpperCase()}</p>
					</motion.div>
				)}
			</motion.main>
			<footer className={`py-4 ${darkMode ? "bg-gray-800" : "bg-blue-500"}`}>
				<div className="container mx-auto text-center">
					<p>{new Date().getFullYear()} &copy; Group 6. All rights reserved.</p>
				</div>
			</footer>
		</div>
	);
}
