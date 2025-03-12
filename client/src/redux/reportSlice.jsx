import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { authFetch } from "./auth";

const initialState = {
  reportLoading: false,
  contract: null,
  reportId: "",
  reportName: "",
  templateType: "",
  reportType: "",
  meetTo: "",
  meetContact: "",
  meetEmail: "",
  shownTo: "",
  shownContact: "",
  shownEmail: "",
  inspectionDate: "",
  image1: null,
  image2: null,
  details: [],
  reports: [],
  search: "",
  reportsStats: [],
  mailId: "",
  emailList: [],
  totalPages: 1,
  page: 1,
  singleReport: {},
};

export const createReport = createAsyncThunk(
  "report/create",
  async (form, thunkAPI) => {
    try {
      const res = await authFetch.post("/report/create", form);
      return res.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data.msg);
    }
  }
);

export const newReport = createAsyncThunk(
  "newReport/create",
  async (form, thunkAPI) => {
    try {
      const res = await authFetch.post("/report/newReport/1", form);
      return res.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data.msg);
    }
  }
);

export const addNewPage = createAsyncThunk(
  "newReport/addPage",
  async ({ formValue, id }, thunkAPI) => {
    try {
      const res = await authFetch.patch(`/report/newReport/${id}`, formValue);
      return res.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data.msg);
    }
  }
);

export const generateReport = createAsyncThunk(
  "report/generate",
  async (id, thunkAPI) => {
    try {
      const res = await authFetch.get(`/report/generate/${id}`);
      thunkAPI.dispatch(allReports(""));
      return res.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data.msg);
    }
  }
);

export const editReport = createAsyncThunk(
  "report/edit",
  async ({ id, form }, thunkAPI) => {
    try {
      const res = await authFetch.patch(`/report/editReport/${id}`, form);
      thunkAPI.dispatch(allReports(""));
      return res.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data.msg);
    }
  }
);

export const deleteReport = createAsyncThunk(
  "report/delete",
  async (id, thunkAPI) => {
    try {
      const res = await authFetch.delete(`/report/editReport/${id}`);
      return res.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data.msg);
    }
  }
);

export const allReports = createAsyncThunk(
  "report/all",
  async (search, thunkAPI) => {
    try {
      let url = `/report/allReports?page=${thunkAPI.getState().report.page}`;
      if (search) url += `&search=${search}`;
      const res = await authFetch.get(url);
      return res.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data.msg);
    }
  }
);

export const sendEmail = createAsyncThunk(
  "report/verify",
  async (form, thunkAPI) => {
    try {
      const res = await authFetch.post(`/report/sendEmail`, form);
      return res.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data.msg);
    }
  }
);

export const contractDetails = createAsyncThunk(
  "report/contractDetails",
  async (search, thunkAPI) => {
    try {
      const res = await axios.get(
        `https://cqr1.herokuapp.com/api/contractDetails?search=${search}`
      );
      return res.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data.msg);
    }
  }
);

export const imageUpload = createAsyncThunk(
  "report/testUpload",
  async (form, thunkAPI) => {
    try {
      const res = await authFetch.post(`/report/uploadImage`, form);
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getReportDetails = createAsyncThunk(
  "report/reportDetails",
  async (id, thunkAPI) => {
    try {
      const res = await authFetch.get(`/report/reportDetails/${id}`);
      return res.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data.msg);
    }
  }
);

export const submitReport = createAsyncThunk(
  "report/submitReport",
  async (id, thunkAPI) => {
    try {
      const res = await authFetch.patch(`/report/reportDetails/${id}`);

      return res.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error.response.data.msg);
    }
  }
);

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    reportHandleChange: (state, { payload: { name, value } }) => {
      state[name] = value;
    },
    setImageData: (state, payload) => { },
    sortReportsByEmailSend: (state) => {
      state.reports.sort((a, b) => {
        if (!a.email && b.email) {
          return -1;
        }
        else if (a.email && !b.email) {
          return 1;
        }
        else {
          return 0;
        }
      });
    },
    sortReportsbyCreatedAt: (state) => {
      state.reports.sort((a, b) => {
        // Convert strings to Date objects and compare
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);

        // Compare dateB with dateA for descending order
        return dateB - dateA;
      });
    },
    mailForm: (state, { payload: { id, emails } }) => {
      state.mailId = id;
      state.emailList = emails;
    },
    changePage: (state, { payload }) => {
      state.page = payload;
    },
    createContract: (state, { payload }) => {
      state.contract = payload;
    },
    clearReport: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createReport.pending, (state) => {
        state.reportLoading = true;
      })
      .addCase(createReport.fulfilled, (state, { payload }) => {
        toast.success(payload.msg, { autoClose: 1000 });
        return { ...state, ...initialState };
      })
      .addCase(createReport.rejected, (state, { payload }) => {
        state.reportLoading = false;
        toast.error(payload);
      })
      .addCase(newReport.pending, (state) => {
        state.reportLoading = true;
      })
      .addCase(newReport.fulfilled, (state, { payload }) => {
        state.reportId = payload.id;
        state.reportLoading = false;
        toast.success(payload.msg, { autoClose: 1000 });
      })
      .addCase(newReport.rejected, (state, { payload }) => {
        state.reportLoading = false;
        toast.error(payload);
      })
      .addCase(addNewPage.pending, (state) => {
        state.reportLoading = true;
      })
      .addCase(addNewPage.fulfilled, (state, { payload }) => {
        state.reportLoading = false;
        toast.success(payload.msg, { autoClose: 1000 });
      })
      .addCase(addNewPage.rejected, (state, { payload }) => {
        state.reportLoading = false;
        toast.error(payload);
      })
      .addCase(allReports.pending, (state) => {
        state.reportLoading = true;
      })
      .addCase(allReports.fulfilled, (state, { payload }) => {
        state.reports = payload.reports;
        state.reportsStats = payload.stats;
        state.totalPages = payload.totalPages;
        state.reportLoading = false;
      })
      .addCase(allReports.rejected, (state, { payload }) => {
        state.reportLoading = false;
        console.log(payload);
        toast.error(payload);
      })
      .addCase(sendEmail.pending, (state) => {
        state.reportLoading = true;
      })
      .addCase(sendEmail.fulfilled, (state, { payload }) => {
        state.reportLoading = false;
        toast.success(payload.msg);
      })
      .addCase(sendEmail.rejected, (state, { payload }) => {
        state.reportLoading = false;
        toast.error(payload);
      })
      .addCase(contractDetails.pending, (state) => {
        state.reportLoading = true;
        state.contract = null;
      })
      .addCase(contractDetails.fulfilled, (state, { payload }) => {
        state.reportLoading = false;
        state.contract = payload.details;
      })
      .addCase(contractDetails.rejected, (state, { payload }) => {
        state.reportLoading = false;
        toast.error(payload);
      })
      .addCase(editReport.pending, (state) => {
        state.reportLoading = true;
      })
      .addCase(editReport.fulfilled, (state, { payload }) => {
        state.reportLoading = false;
        toast.success(payload.msg);
      })
      .addCase(editReport.rejected, (state, { payload }) => {
        state.reportLoading = false;
        toast.error(payload);
      })
      .addCase(generateReport.pending, (state) => {
        state.reportLoading = true;
      })
      .addCase(generateReport.fulfilled, (state, { payload }) => {
        state.reportLoading = false;
        toast.success(payload.msg);
      })
      .addCase(generateReport.rejected, (state, { payload }) => {
        state.reportLoading = false;
        toast.error(payload);
      })
      .addCase(imageUpload.pending, (state) => {
        state.reportLoading = true;
        toast.info("Image Uploading");
      })
      .addCase(imageUpload.fulfilled, (state, { payload }) => {
        state.reportLoading = false;
        toast.success(payload.msg, { autoClose: 1000 });
      })
      .addCase(imageUpload.rejected, (state, { payload }) => {
        state.reportLoading = false;
        toast.error(payload, { autoClose: 1000 });
      })
      .addCase(getReportDetails.pending, (state) => {
        state.reportLoading = true;
      })
      .addCase(getReportDetails.fulfilled, (state, { payload }) => {
        state.reportLoading = false;
        state.singleReport = payload;
      })
      .addCase(getReportDetails.rejected, (state, { payload }) => {
        state.reportLoading = false;
        toast.error(payload, { autoClose: 1000 });
      })
      .addCase(submitReport.pending, (state) => {
        state.reportLoading = true;
      })
      .addCase(submitReport.fulfilled, (state, { payload }) => {
        state.reportLoading = false;
        state.singleReport = {};
        toast.success(payload.msg);
      })
      .addCase(submitReport.rejected, (state, { payload }) => {
        state.reportLoading = false;
        toast.error(payload, { autoClose: 1000 });
      })
      .addCase(deleteReport.pending, (state) => {
        state.reportLoading = true;
      })
      .addCase(deleteReport.fulfilled, (state, { payload }) => {
        state.reportLoading = false;
        toast.success(payload.msg);
      })
      .addCase(deleteReport.rejected, (state, { payload }) => {
        state.reportLoading = false;
        toast.error(payload, { autoClose: 1000 });
      });
  },
});

export const {
  reportHandleChange,
  mailForm,
  changePage,
  clearReport,
  createContract,
  sortReportsByEmailSend,
  sortReportsbyCreatedAt,
} = reportSlice.actions;

export default reportSlice.reducer;
