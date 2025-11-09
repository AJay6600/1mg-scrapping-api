import { Button, Card, Col, message, Row, Typography } from "antd";
import { useForm } from "react-hook-form";
import Upload from "./components/Upload";
import { PiUploadSimpleBold } from "react-icons/pi";
import * as XLSX from "xlsx";
import { useState } from "react";
import { useCategory } from "./hooks/useCategory";
import { IoMdDownload } from "react-icons/io";

type CategoryFormType = {
  inputFile: {
    file: File;
  };
};

type CategoryType = {
  name: string;
  category: string;
};

const { Text } = Typography;

function App() {
  const {
    control,
    formState: { errors },
    watch,
    handleSubmit,
    setError,
    reset,
  } = useForm<CategoryFormType>({
    mode: "onChange",
  });

  const [category, setCategory] = useState<CategoryType[]>([]);

  const { mutateAsync, isPending } = useCategory();

  /** Function to get handle to get category */
  const handleGetCategory = (formData: CategoryFormType) => {
    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData =
          XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

        if (jsonData.length === 0) {
          setError("inputFile", {
            message: "Uploaded file is empty or invalid.",
          });
          return;
        }

        const firstRow = jsonData[0];
        const normalizedKeys = Object.keys(firstRow).map((k) =>
          k.toLowerCase()
        );
        const hasNameColumn = normalizedKeys.includes("name");

        if (!hasNameColumn) {
          setError("inputFile", {
            message: "The uploaded file must contain a 'name' column.",
          });

          return;
        }

        const namesArray = jsonData
          .map((row) => {
            const nameKey = Object.keys(row).find(
              (k) => k.toLowerCase() === "name"
            );
            return nameKey ? row[nameKey] : null;
          })
          .filter(Boolean);

        if (
          namesArray &&
          Array.isArray(namesArray) &&
          namesArray.length === 0
        ) {
          setError("inputFile", {
            message: "No values found under the 'name' column.",
          });

          return;
        }

        for (const medicean of namesArray) {
          const response = await mutateAsync({
            mediceanName: medicean as string,
          });

          setCategory((prev) => [
            ...prev,
            {
              name: medicean as string,
              category:
                response &&
                response.data &&
                Array.isArray(response.data) &&
                response.data.length > 0
                  ? response.data.join("->")
                  : (response.data as string),
            },
          ]);
        }
      };

      reader.readAsArrayBuffer(formData.inputFile.file);

      if (
        category &&
        Array.isArray(category) &&
        category.length > 0 &&
        !isPending
      ) {
        console.log("reseting");
        reset();
      }
    } catch (error) {
      const err = error as Error;
      message.error(err.message);
    }
  };

  /** Function to download the xslx sheet */
  const handleDownloadExcel = () => {
    if (!category || category.length === 0) {
      alert("No data available to export!");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(category);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "categories.xlsx";
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /** Function to download the template file */
  const handleDownloadTemplate = () => {
    // Static data
    const data = [{ name: "Paracetamol" }, { name: "Amoxicillin" }];

    if (!data || data.length === 0) {
      alert("No data available to export!");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, "template.xlsx");
  };

  return (
    <Row
      justify={category ? "center" : "space-between"}
      align="middle"
      className="h-[100vh] bg-[#242424] overflow-auto px-2"
      gutter={[0, 15]}
    >
      <Col xs={22} lg={10} className="lg:mr-3">
        <Card className="bg-[#1f1f1f] border-black shadow-lg">
          <form onSubmit={handleSubmit(handleGetCategory)}>
            <Row justify="center" align="middle" gutter={[0, 20]}>
              <Col span={12}>
                <Text className="text-white text-lg font-semibold flex justify-start">
                  Upload File
                </Text>
              </Col>

              <Col span={12} className="flex justify-end">
                <Button
                  icon={<IoMdDownload size={16} />}
                  type="primary"
                  className="bg-[#1f1f1f] border-white"
                  onClick={handleDownloadTemplate}
                >
                  Download template
                </Button>
              </Col>

              <Col span={24}>
                <Upload
                  name="inputFile"
                  hasError={!!(errors && errors.inputFile)}
                  rhfControllerProps={{ control }}
                  // onChange={() => {
                  //   setCategory([]);
                  // }}
                  antdUploadProps={{
                    multiple: false,
                    accept: ".csv, .xlsx, .xls",
                  }}
                >
                  <div className="flex flex-col items-center justify-center text-white">
                    <div className="mb-2">
                      <PiUploadSimpleBold
                        size={36}
                        className="text-label-300"
                      />
                    </div>
                    <p className="font-medium text-base">
                      Drag and drop a Xlsx or Excel file here
                    </p>
                    <p className="text-sm mt-1">
                      or click to select file locally
                    </p>
                  </div>
                </Upload>
              </Col>

              {errors && errors.inputFile && errors.inputFile.message && (
                <Col span={24}>
                  <Text className="text-[red]">{errors.inputFile.message}</Text>
                </Col>
              )}

              <Col span={24}>
                <Button
                  disabled={!watch("inputFile")}
                  loading={isPending}
                  type="primary"
                  htmlType="submit"
                  className="w-full text-white"
                >
                  Get Category
                </Button>
              </Col>

              {category &&
                Array.isArray(category) &&
                category.length > 0 &&
                !isPending && (
                  <>
                    <Col span={24}>
                      <Button
                        icon={<IoMdDownload size={22} />}
                        type="primary"
                        className="w-full text-white"
                        onClick={() => {
                          handleDownloadExcel();
                        }}
                      >
                        Download xlsx
                      </Button>
                    </Col>

                    <Col span={24}>
                      <Button
                        type="primary"
                        className="w-full text-white"
                        onClick={() => {
                          reset();
                          setCategory([]);
                        }}
                      >
                        Reset form
                      </Button>
                    </Col>
                  </>
                )}
            </Row>
          </form>
        </Card>
      </Col>

      {category && Array.isArray(category) && category.length > 0 && (
        <Col xs={22} lg={13}>
          <Card size="small" className="bg-[#1f1f1f] border-black shadow-lg">
            <Row
              className="text-white p-4 rounded-md mt-3 max-h-[500px] overflow-auto"
              gutter={[0, 10]}
            >
              <Col span={24} className="flex justify-center">
                <Text className="text-lg text-white font-medium">Result</Text>
              </Col>

              {category.map((element, index) => (
                <Col key={index} span={24} className="bg-[#141414] p-1">
                  <Row>
                    <Col span={24}>
                      <Text className="text-white">
                        <span className="text-[#1958b0]">Medicean Name :</span>{" "}
                        {element.name}
                      </Text>
                    </Col>

                    <Col>
                      <Text className="text-white">
                        <span className="text-[#1958b0]">Category :</span>{" "}
                        {element.category}
                      </Text>
                    </Col>
                  </Row>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      )}
    </Row>
  );
}

export default App;
