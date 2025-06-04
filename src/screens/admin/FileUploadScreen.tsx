import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uri: string;
  uploadProgress: number;
  status: "pending" | "uploading" | "success" | "error";
}

interface FileUploadScreenProps {
  route?: {
    params?: {
      maxFiles?: number;
      allowedTypes?: string[];
      purpose?: string;
    };
  };
  navigation: any;
}

export const FileUploadScreen: React.FC<FileUploadScreenProps> = ({
  route,
  navigation,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const maxFiles = route?.params?.maxFiles || 10;
  const allowedTypes = route?.params?.allowedTypes || [
    "image/*",
    "application/pdf",
    "text/*",
  ];
  const purpose = route?.params?.purpose || "General Upload";

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to upload images."
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        const newFiles = result.assets.map((asset, index) => ({
          id: `${Date.now()}_${index}`,
          name: asset.fileName || `image_${Date.now()}_${index}.jpg`,
          type: asset.type || "image/jpeg",
          size: asset.fileSize || 0,
          uri: asset.uri,
          uploadProgress: 0,
          status: "pending" as const,
        }));

        setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const newFiles = result.assets.map((asset, index) => ({
          id: `${Date.now()}_${index}`,
          name: asset.name,
          type: asset.mimeType || "application/octet-stream",
          size: asset.size || 0,
          uri: asset.uri,
          uploadProgress: 0,
          status: "pending" as const,
        }));

        setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      Alert.alert("Error", "Please select files to upload");
      return;
    }

    setUploading(true);

    try {
      // Simulate file upload with progress
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Update status to uploading
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "uploading" as const } : f
          )
        );

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));

          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, uploadProgress: progress } : f
            )
          );
        }

        // TODO: Replace with actual upload service
        // const uploadedFile = await fileService.uploadFile(file);

        // Simulate random success/failure
        const success = Math.random() > 0.2; // 80% success rate

        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: success ? ("success" as const) : ("error" as const),
                  uploadProgress: success ? 100 : 0,
                }
              : f
          )
        );
      }

      const successCount = files.filter((f) => f.status === "success").length;
      const errorCount = files.filter((f) => f.status === "error").length;

      if (errorCount === 0) {
        Alert.alert(
          "Success",
          `All ${successCount} files uploaded successfully!`
        );
        navigation.goBack();
      } else {
        Alert.alert(
          "Upload Complete",
          `${successCount} files uploaded successfully, ${errorCount} failed.`
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return "image-outline";
    if (type === "application/pdf") return "document-text-outline";
    if (type.startsWith("text/")) return "document-outline";
    return "document-outline";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#999";
      case "uploading":
        return "#007AFF";
      case "success":
        return "#34C759";
      case "error":
        return "#FF3B30";
      default:
        return "#999";
    }
  };

  const renderFileItem = ({ item }: { item: UploadedFile }) => (
    <Card style={styles.fileItem}>
      <View style={styles.fileHeader}>
        <Ionicons
          name={getFileIcon(item.type)}
          size={24}
          color="#666"
          style={styles.fileIcon}
        />
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.fileSize}>
            {formatFileSize(item.size)} • {item.type}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => removeFile(item.id)}
          disabled={uploading}
          style={styles.removeButton}
        >
          <Ionicons name="close-circle" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {item.status === "uploading" && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${item.uploadProgress}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{item.uploadProgress}%</Text>
        </View>
      )}

      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        />
        <Text
          style={[styles.statusText, { color: getStatusColor(item.status) }]}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Card style={styles.header}>
          <Text style={styles.title}>File Upload</Text>
          <Text style={styles.subtitle}>Upload files for: {purpose}</Text>
          <Text style={styles.info}>
            Maximum {maxFiles} files • Accepted: Images, PDFs, Documents
          </Text>
        </Card>

        <Card style={styles.uploadOptions}>
          <Text style={styles.sectionTitle}>Select Files</Text>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickImage}
            disabled={uploading || files.length >= maxFiles}
          >
            <Ionicons name="camera-outline" size={24} color="#007AFF" />
            <Text style={styles.uploadButtonText}>Upload Images</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickDocument}
            disabled={uploading || files.length >= maxFiles}
          >
            <Ionicons name="document-outline" size={24} color="#007AFF" />
            <Text style={styles.uploadButtonText}>Upload Documents</Text>
          </TouchableOpacity>
        </Card>

        {files.length > 0 && (
          <Card style={styles.filesSection}>
            <Text style={styles.sectionTitle}>
              Selected Files ({files.length}/{maxFiles})
            </Text>

            <FlatList
              data={files}
              renderItem={renderFileItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </Card>
        )}
      </ScrollView>

      {files.length > 0 && (
        <View style={styles.footer}>
          <Button
            title={uploading ? "Uploading..." : "Upload Files"}
            onPress={uploadFiles}
            loading={uploading}
            disabled={uploading}
            style={styles.uploadAllButton}
          />
        </View>
      )}

      {uploading && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Uploading files...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
  },
  header: {
    margin: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  info: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  uploadOptions: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
    marginBottom: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    color: "#007AFF",
    marginLeft: 12,
    fontWeight: "500",
  },
  filesSection: {
    margin: 16,
    marginTop: 8,
  },
  fileItem: {
    marginBottom: 12,
    padding: 12,
  },
  fileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileIcon: {
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  fileSize: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginRight: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    minWidth: 35,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  uploadAllButton: {
    width: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    marginTop: 16,
  },
});

export default FileUploadScreen;
