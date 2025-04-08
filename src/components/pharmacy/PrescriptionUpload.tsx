
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileImage, CheckCircle, XCircle } from "lucide-react";

const PrescriptionUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    
    if (!selectedFile) return;
    
    // Check if file is an image
    if (!selectedFile.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (limit to 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // In a real app, you would upload the file to a server here
      // For now, we'll simulate a successful upload after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Prescription uploaded",
        description: "Our pharmacist will review your prescription and contact you shortly.",
      });
      
      // Reset the form
      setFile(null);
      setPreview(null);
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your prescription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {!preview ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
            <input
              type="file"
              id="prescription-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label 
              htmlFor="prescription-upload" 
              className="cursor-pointer flex flex-col items-center justify-center h-24"
            >
              <FileImage className="h-12 w-12 mb-2 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click to upload your prescription
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                (JPEG, PNG, PDF, up to 5MB)
              </p>
            </label>
          </div>
        ) : (
          <div className="relative">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={preview} 
                alt="Prescription preview" 
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium mb-1">{file?.name}</p>
              <p className="text-xs text-gray-500">
                {(file?.size ? (file.size / 1024 / 1024).toFixed(2) : "0")} MB
              </p>
            </div>
            <Button 
              className="w-full mt-4 bg-mediwrap-blue hover:bg-mediwrap-blue-light text-white"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⏳</span>
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Prescription
                </span>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrescriptionUpload;
