import { Types } from "mongoose"

export interface CreateAnnouncement {
    students?: string[],
    cohortId?:Types.ObjectId,
    courseId?:Types.ObjectId
    title: string
    summary: string
}


export interface CreateAnnouncementResponse {
    audience: string
    title: string
    summary: string
}