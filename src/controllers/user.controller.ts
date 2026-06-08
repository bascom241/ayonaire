import { Request, Response, NextFunction } from "express";
import csvParser from "csv-parser";
import { Readable } from "node:stream";
import {
  AcceptInviteRequest,
  AddUserDto,
  EditProfileRequest,
  InviteRequest,
  ProfileImageRequest,
  UserParams,
} from "../types/user.types.js";
import {
  createUser,
  fetchNonAdminUsers,
  loginUser,
  refreshAuthToken,
  logoutUser,
  editUser,
  loginHistory,
  userActivity,
  assignRole,
  deactivateUser,
  suspendUser,
  viewProfile,
  addProfileImage,
  editProfile,
  addUser,
  inviteUser,
  acceptInvite,
} from "../services/user.service.js";
import { AppError } from "../errors/AppError.js";
import { Express } from "express";
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = await loginUser(req.body, req.ip, req.headers["user-agent"]);
    res.status(200).json({ success: true, data: token });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await refreshAuthToken(
      req.body,
      req.ip,
      req.headers["user-agent"],
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const message = await logoutUser(req.body, req.user?.id);
    res.status(200).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

export const getNonAdminUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await fetchNonAdminUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const assignRoleToUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as unknown as UserParams;
    const data = await assignRole(id, req.body);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const suspendToUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as unknown as UserParams;
    await suspendUser(id);
    res.status(200).json({ success: true, message: "user suspended" });
  } catch (error) {
    next(error);
  }
};

export const deactivateToUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as unknown as UserParams;
    await deactivateUser(id);
    res.status(200).json({ success: true, message: "user deactivated" });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as unknown as UserParams;
    const data = await editUser(id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getUserLoginHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as unknown as UserParams;
    const data = await loginHistory(id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getUserActivityHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as unknown as UserParams;
    const data = await userActivity(id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

interface AuthRequest extends Request {
  user?: { id: string };
}
export const viewMyProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.user as any;

    if (!id) {
      throw new AppError(
        "user id is required! cant destructure from token",
        400,
      );
    }

    const data = await viewProfile(id);
    console.log(data);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

interface UploadImageRequest extends Request {
  user?: { id: string };
  file?: Express.Multer.File;
}

export const uploadImage = async (
  req: UploadImageRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.user?.id;
    if (!id) {
      throw new AppError("Unauthorized", 401);
    }

    console.log("req.file:", req.file);

    if (!req.file) {
      throw new AppError("Thumbnail is required", 400);
    }
    const dataToSend: ProfileImageRequest = {
      profile: req.file,
    };

    const data = await addProfileImage(dataToSend, id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    next(error);
  }
};

interface EditProfileReq extends Request {
  body: EditProfileRequest["name"];
  user?: { id: string };
  file?: Express.Multer.File;
}

export const edit = async (
  req: EditProfileReq,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.user?.id;
    if (!id) {
      throw new AppError("Unauthorized", 401);
    }

    console.log("req.file:", req.file);

    if (!req.file) {
      throw new AppError("Thumbnail is required", 400);
    }
    const dataToSend: EditProfileRequest = {
      name: req.body.name,
      profile: req.file,
    };

    const data = await editProfile(id, dataToSend);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.log("Updat Error: ", error);
    next(error);
  }
};

// Not yet tested with post man
export const add = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dataToSend: AddUserDto = {
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      role: req.body.role,
      status: req.body.status,
      password: req.body.password,
      courseId: req.body.courseId,
      cohortId: req.body.cohortId,
    };

    const data = await addUser(dataToSend);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const invite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dataToSend: InviteRequest = {
      emails: req.body.emails,
      courseId: req.body.courseId,
      cohortId: req.body.cohortId,
    };

    const data = await inviteUser(dataToSend);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const accept = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.params;

    if (typeof token !== "string") {
      throw new AppError("Invalid token format",400);
    }
    const dataToSend: AcceptInviteRequest = {
      token,
      name: req.body.name,
      password: req.body.password,
    };

    const data = await acceptInvite(dataToSend);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};


export const inviteUserCsv = async (req: Request, res: Response, next: NextFunction) => {
  try {
      if(!req.file){
        throw new AppError("csv file is required", 400);
      }
      const emails: string[] = [];

      const stream = Readable.from(req.file.buffer);
      await new Promise((resolve, reject) => {
        stream.pipe(csvParser())
        .on("data", (row)=> {
          if(row.email){
            emails.push(row.email.trim())
          }
        })
        .on("end", resolve)
        .on("error", reject);
      });

      const uniqueEmails = [...new Set(emails)];

      const data = await inviteUser({
        emails: uniqueEmails,
        courseId: req.body.courseId,
      cohortId: req.body.cohortId,
      });

      res.status(200).json({success: true, data})
  } catch (error) {
    next(error)
  }
}
