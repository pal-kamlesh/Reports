import Report from "../models/Report.js";
import Admin from "../models/Admin.js";
import newdoc from "docx-templates";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import sgMail from "@sendgrid/mail";
import Stream from "stream";
import { getCloudinaryDetails } from "../utils/cloudinary.js";
import path, { dirname } from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

export const createReport = async (req, res) => {
  const {
    reportName,
    templateType,
    reportType,
    details,
    meetTo,
    meetContact,
    shownTo,
    shownContact,
    inspectionDate,
    meetEmail,
    shownEmail,
    contract,
  } = req.body;
  try {
    if (!reportName || !templateType || !reportType)
      return res.status(400).json({ msg: "Please provide all values" });

    if (templateType === "Direct" && req.files.file) {
      const link = await uploadFile(req.files.file);
      // if (req.files.quot) req.body.quotation = await uploadFile(req.files.quot);
      req.body.emailList = contract.split(",");
      req.body.contract = { name: "Direct" };
      req.body.link = link;
      req.body.inspectionBy = shownTo;
      req.body.meetDetails = { name: "Direct" };
      req.body.shownDetails = { name: "Direct" };
      req.body.approved = true;
      req.body.completed = true;
      req.body.user = req.user.userId;
      await Report.create(req.body);
      return res.status(201).json({ msg: "Report successfully uploaded." });
    }

    let emailList = contract.billToEmails.concat(contract.shipToEmails);
    if (meetEmail.length > 0) emailList.push(meetEmail);
    if (shownEmail.length > 0) emailList.push(shownEmail);

    contract.number = capitalLetter(contract.number);
    contract.billToName = capitalLetter(contract.billToName);
    contract.shipToName = capitalLetter(contract.shipToName);

    const meetDetails = {
      name: capitalLetter(meetTo),
      contact: meetContact,
      email: meetEmail,
    };

    const shownDetails = {
      name: capitalLetter(shownTo),
      contact: shownContact,
      email: shownEmail,
    };

    await Report.create({
      reportName,
      reportType,
      templateType,
      meetDetails,
      shownDetails,
      inspectionBy: req.user.name,
      inspectionDate,
      contract,
      details,
      emailList,
    });

    res.status(201).json({ msg: "Report successfully saved." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const newReport = async (req, res) => {
  const {
    reportName,
    templateType,
    reportType,
    meetTo,
    meetContact,
    shownTo,
    shownContact,
    inspectionDate,
    meetEmail,
    shownEmail,
    contract,
  } = req.body;
  try {
    if (!reportName || !templateType || !reportType)
      return res.status(400).json({ msg: "Please provide all values" });

    let emailList = contract.billToEmails.concat(contract.shipToEmails);
    if (meetEmail.length > 0) emailList.push(meetEmail);
    if (shownEmail.length > 0) emailList.push(shownEmail);

    contract.number = capitalLetter(contract.number);
    contract.billToName = capitalLetter(contract.billToName);
    contract.shipToName = capitalLetter(contract.shipToName);

    const meetDetails = {
      name: capitalLetter(meetTo),
      contact: meetContact,
      email: meetEmail,
    };

    const shownDetails = {
      name: capitalLetter(shownTo),
      contact: shownContact,
      email: shownEmail,
    };

    const newReport = await Report.create({
      reportName,
      reportType,
      templateType,
      meetDetails,
      shownDetails,
      inspectionBy: req.user.name,
      inspectionDate,
      contract,
      emailList,
      user: req.user.userId,
    });

    return res.status(201).json({ id: newReport._id, msg: "Report created." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const addPage = async (req, res) => {
  const { id } = req.params;
  const {
    pest,
    floor,
    subFloor,
    location,
    finding,
    suggestion,
    comment,
    image1,
    image2,
  } = req.body;

  try {
    const report = await Report.findById(id);
    if (!report) return res.stats(404).json({ msg: "Report Not Found" });

    report.details.push({
      pest,
      floor,
      subFloor,
      location,
      finding,
      suggestion,
      comment,
      image1,
      image2,
    });
    report.save();

    return res.status(200).json({ msg: "Page added" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const reportDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const report = await Report.findById(id);
    if (!report) return res.stats(404).json({ msg: "Report Not Found" });

    return res.json(report);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const submitReport = async (req, res) => {
  const { id } = req.params;
  try {
    const report = await Report.findById(id);
    report.completed = true;
    await report.save();

    return res.status(200).json({ msg: "Report successfully submitted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server error, try again later" });
  }
};

const capitalLetter = (phrase) => {
  return phrase
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const generateReport = async (req, res) => {
  const { id } = req.params;
  try {
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ msg: "Report Not Found" });

    const admin = await Admin.findOne({
      "template.templateType": report.templateType,
      "template.reportType": report.reportType,
    }).lean();
    const fileUrl = admin?.template?.file;
    if (!fileUrl) {
      return res
        .status(400)
        .json({ msg: "No matching template found while generating" });
    }
    const resp = await axios.get(fileUrl, {
      responseType: "arraybuffer",
    });
    const template = Buffer.from(resp.data);

    let width = report.templateType !== "Single Picture" ? 9 : 18;

    const buffer = await newdoc.createReport({
      cmdDelimiter: ["{", "}"],
      template,
      additionalJsContext: {
        meetTo: report.meetDetails.name,
        meetContact: report.meetDetails.contact,
        meetEmail: report.meetDetails.email,
        shownTo: report.shownDetails.name,
        shownContact: report.shownDetails.contact,
        shownEmail: report.shownDetails.email,
        inspectionBy: report.inspectionBy,
        inspectionDate: report.inspectionDate,
        contract: report.contract,
        data: report.details,
        image: async (
          url = "https://res.cloudinary.com/epcorn/image/upload/v1674627399/signature/No_Image_Available_ronw0k.jpg"
        ) => {
          const resp = await axios.get(url, {
            responseType: "arraybuffer",
          });
          const buffer = Buffer.from(resp.data, "binary").toString("base64");
          return {
            width: width,
            height: 13,
            data: buffer,
            extension: ".jpg",
          };
        },
      },
    });
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    if (buffer.length > MAX_FILE_SIZE) {
      {
        /* uncomment this code to get file to be uplad manually maybe after compression */
      }

      // const filePath = path.resolve(
      //   __dirname,
      //   "../files",
      //   `${report.reportName}.docx`
      // );
      // await fs.writeFile(filePath, buffer);
      const fileSizeInMB = (buffer.length / (1024 * 1024)).toFixed(2);
      return res.status(400).json({
        msg: `File size is too large (${fileSizeInMB} MB). Maximum allowed size is 10 MB. Please contact Admin for assistance.`,
      });
    }
    const result = await streamUploadToCloudinary(
      buffer,
      `${report.reportName}.docx`
    );
    report.link = result.secure_url;
    await report.save();

    res.status(201).json({ msg: "Report successfully generated." });
  } catch (error) {
    console.log("Error genereating Reports:", error);
    return res.status(500).json({ msg: "Server error, try again later" });
  }
};

function streamUploadToCloudinary(buffer, filename) {
  const newFilename = filename.split(" ").join("_");
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        use_filename: true,
        folder: "reports",
        public_id: newFilename,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const bufferStream = new Stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });
}

export const deleteReport = async (req, res) => {
  try {
    return res.json({ msg: "Contact Admin for deletion" });
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ msg: "Report not found" });

    const deletePromises = [];

    //it is recommened to use for of loop or traditional for loop, and not forEach loop
    for (const detail of report.details) {
      if (detail.image1) {
        const public_idImage1 = getCloudinaryDetails(detail.image1);
        deletePromises.push(
          cloudinary.uploader.destroy(public_idImage1.public_id)
        );
      }
      if (detail.image2) {
        const public_idImage2 = getCloudinaryDetails(detail.image2);
        deletePromises.push(
          cloudinary.uploader.destroy(public_idImage2.public_id)
        );
      }
    }
    if (report.link) {
      const { public_id, resource_type } = getCloudinaryDetails(report.link);
      console.log(`PublicId: ${public_id}, ResourceType: ${resource_type}`);
      deletePromises.push(
        cloudinary.uploader.destroy(public_id, {
          resource_type,
          invalidate: true,
        })
      );
    }
    if (report.quotation) {
      const { public_id, resource_type } = getCloudinaryDetails(
        report.quotation
      );
      deletePromises.push(
        cloudinary.uploader.destroy(public_id, {
          resource_type,
          invalidate: true,
        })
      );
    }
    // Await all deletions to finish
    await Promise.all(deletePromises);

    await Report.deleteOne({ _id: req.params.id });

    return res.json({ msg: "Report deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error, try again later" });
  }
};

// export const uploadImages = async (req, res) => {
//   try {
//     const result = await cloudinary.uploader.upload(
//       req.files.image.tempFilePath,
//       {
//         use_filename: true,
//         folder: "reports",
//         quality: 30,
//         width: 800,
//       }
//     );
//     fs.unlinkSync(req.files.image.tempFilePath);

//     return res.status(201).json({
//       msg: "ok",
//       link: result.secure_url,
//       imageCount: req.body.imageCount,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ msg: "Server error, try again later" });
//   }
// };

export const imageUpload = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      use_filename: true,
      folder: "reports",
      width: 800,
      quality: 70,
    });
    return res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.log(error);
  }
};

export const editReport = async (req, res) => {
  const { id } = req.params;
  try {
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ msg: "Report not found" });

    if (req.files.file) {
      const data = await uploadFile(req.files.file);
      console.log(data);
      report.link = data;
      report.approved = true;
      await report.save();
    }

    if (req.files.quotation) {
      report.quotation = await uploadFile(req.files.quotation);
      report.approved = true;
      await report.save();
    }

    return res.status(200).json({ msg: "Report has been updated" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const allReports = async (req, res) => {
  const { search } = req.query;
  const searchObject = { completed: true };
  try {
    if (search) searchObject.reportName = { $regex: search, $options: "i" };

    const allReports = await Report.find();
    const approved = allReports.filter((item) => item.approved === true).length;
    const email = allReports.filter((item) => item.email === true).length;

    const stats = [
      {
        bg: "secondary",
        count: allReports.length,
        text: "Number Of Reports",
      },
      {
        bg: "danger",
        count: allReports.length - approved,
        text: "Pending For Approval",
      },
      {
        bg: "success",
        count: approved,
        text: "Reports Approved",
      },

      {
        bg: "danger",
        count: allReports.length - email,
        text: "Email Not Sent",
      },
    ];

    let repo = Report.find(searchObject)
      .sort("-createdAt")
      .select(
        "reportName reportType inspectionBy inspectionDate link approved email emailList quotation contract createdAt"
      );
    // if (req.user.role === "Field") {
    //   reports = reports.filter((item) => item.inspectionBy === req.user.name);
    // }

    const page = Number(req.query.page) || 1;
    const pageLimit = 20;

    repo = repo.skip(page * pageLimit - pageLimit).limit(pageLimit);

    const reports = await repo;

    const totalPages = Math.ceil(
      (await Report.countDocuments(searchObject)) / pageLimit
    );

    return res.status(200).json({ reports, totalPages, stats });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const sendEmail = async (req, res) => {
  const { emailList, emails, mailId } = req.body;
  try {
    const report = await Report.findById(mailId);
    let reportQuot = `${report.reportType} Report`;

    const files = [{ name: `${report.reportName} Report`, link: report.link }];
    if (report.quotation) {
      reportQuot += " And Quotation";
      files.push({
        name: `${report.reportName} Quotation`,
        link: report.quotation,
      });
    }

    const attach = [];

    for (let i = 0; i < files.length; i++) {
      const fileType = files[i].link.split(".").pop();
      const result = await axios.get(files[i].link, {
        responseType: "arraybuffer",
      });
      const base64File = Buffer.from(result.data, "binary").toString("base64");

      const attachObj = {
        content: base64File,
        filename: `${files[i].name}.${fileType}`,
        type: `application/${fileType}`,
        disposition: "attachment",
      };
      attach.push(attachObj);
    }

    // const fileType = report.link.split(".").pop();
    // const result = await axios.get(report.link, {
    //   responseType: "arraybuffer",
    // });
    // const base64File = Buffer.from(result.data, "binary").toString("base64");

    // const attachObj = {
    //   content: base64File,
    //   filename: `${report.reportName}.${fileType}`,
    //   type: `application/${fileType}`,
    //   disposition: "attachment",
    // };
    // attach.push(attachObj);

    let emailTo = [];
    for (let email of emailList) {
      if (email !== "clientproxymail@gmail.com" && !emailTo.includes(email))
        emailTo.push(email);
    }

    if (emails.length > 0) {
      emailTo = emailTo.concat(emails.split(","));
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: emailTo,
      cc: ["sales@epcorn.com", "natco.epcorn@gmail.com"],
      from: { email: "noreply.epcorn@gmail.com", name: "Epcorn Reports" },
      dynamic_template_data: {
        fileName: report.reportName,
        name: req.user.name,
        report: reportQuot,
        subject: report.reportType,
        inspectionBy: report.inspectionBy,
      },
      template_id: "d-0e9f59c886f84dd7ba895e0a3390697e",
      attachments: attach,
    };
    await sgMail.send(msg);

    report.email = true;
    await report.save();

    const emailData = {
      sendDate: new Date(),
      reportName: report.reportName,
      emails: emailTo.toString(),
      sendBy: req.user.name,
      report: report.link,
      quotation: report.quotation,
    };

    await Admin.create({ emailData });

    res.status(200).json({ msg: "Email has been sent" });
  } catch (error) {
    console.log(error);
    console.log(error.response.body);
    return res.status(500).json({ msg: "Server error, try again later" });
  }
};

export const uploadFile = async (file) => {
  try {
    const docFile = file;
    const docPath = path.join(__dirname, "../files/" + `${docFile.name}`);
    await docFile.mv(docPath);
    const result = await cloudinary.uploader.upload(`files/${docFile.name}`, {
      resource_type: "raw",
      use_filename: true,
      folder: "reports",
    });
    fs.unlinkSync(`./files/${docFile.name}`);
    return result.secure_url;
  } catch (error) {
    console.log(error);
    return error;
  }
};
