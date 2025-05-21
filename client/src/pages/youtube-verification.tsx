import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { YOUTUBE_VIDEO_URL } from "@/lib/constants";

export default function YoutubeVerification() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { data: youtubeStatus } = useQuery({
    queryKey: ['/api/user/youtube-status'],
  });
  
  const { mutate: uploadScreenshot, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/user/youtube-verification", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to upload screenshot");
      }
      return res.json();
    },
    onSuccess: () => {
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/user/youtube-status'] });
      toast({
        title: "Success",
        description: "Your screenshot has been uploaded for verification",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to upload screenshot",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a screenshot to upload",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("screenshot", selectedFile);
    uploadScreenshot(formData);
  };
  
  const isVerified = youtubeStatus?.verified;
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">YouTube Verification</h1>
        <p className="text-gray-500">Complete YouTube tasks to activate your account</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-bold mb-4">Instructions</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-medium text-sm">
                  1
                </div>
                <div>
                  <p className="text-gray-700">Click on the YouTube button below to open our video</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-medium text-sm">
                  2
                </div>
                <div>
                  <p className="text-gray-700">Like the video, subscribe to the channel, and comment "nice video"</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-medium text-sm">
                  3
                </div>
                <div>
                  <p className="text-gray-700">Take a screenshot showing your comment and the video</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-medium text-sm">
                  4
                </div>
                <div>
                  <p className="text-gray-700">Upload the screenshot below for verification</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <a 
                href={YOUTUBE_VIDEO_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <i className="ri-youtube-line"></i>
                <span>Open YouTube Video</span>
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">Upload Verification Screenshot</h2>
            
            <div className="mb-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="mb-3">
                  <i className="ri-upload-cloud-line text-4xl text-gray-400"></i>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {selectedFile ? selectedFile.name : "Drag and drop your screenshot here, or click to browse"}
                </p>
                <p className="text-xs text-gray-400">PNG, JPG or JPEG (max 5MB)</p>
                <input 
                  type="file" 
                  className="hidden" 
                  id="youtubeScreenshot" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <button 
                  className="mt-3 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition"
                  onClick={() => document.getElementById("youtubeScreenshot")?.click()}
                >
                  Select File
                </button>
              </div>
            </div>

            {isVerified && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="ri-check-line text-green-500"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      Your verification is already approved. You don't need to resubmit unless requested by admin.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button 
                className={`px-6 py-2.5 rounded-lg transition ${
                  isVerified 
                    ? "bg-gray-200 text-gray-700" 
                    : "bg-primary-600 text-white hover:bg-primary-700"
                }`}
                onClick={handleUpload}
                disabled={isPending || isVerified || !selectedFile}
              >
                {isVerified ? "Already Verified" : isPending ? "Uploading..." : "Submit Verification"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
