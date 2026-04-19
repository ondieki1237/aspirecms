import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/server/db'
import { verifyToken } from '@/server/auth'
import { User } from '@/server/models/User'
import { Client } from '@/server/models/Client'
import { Task } from '@/server/models/Task'
import { Attendance } from '@/server/models/Attendance'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    // Get all stats
    const totalCounselors = await User.countDocuments({ role: 'counselor' })
    const totalClients = await Client.countDocuments()
    const totalTasks = await Task.countDocuments()
    const completedTasks = await Task.countDocuments({ completed: true })

    // Get counselor stats
    const counselors = await User.find({ role: 'counselor' })
      .select('name email')
      .lean()

    const counselorStats = await Promise.all(
      counselors.map(async (counselor: any) => {
        const clientCount = await Client.countDocuments({
          counselorId: counselor._id,
        })
        const taskCount = await Task.countDocuments({
          counselorId: counselor._id,
        })
        const attendance = await Attendance.find({
          userId: counselor._id,
        }).lean()

        const presentDays = attendance.filter((a: any) => a.status === 'present')
          .length
        const attendanceRate =
          attendance.length > 0 ? (presentDays / attendance.length) * 100 : 0

        return {
          _id: counselor._id,
          name: counselor.name,
          email: counselor.email,
          clientCount,
          taskCount,
          attendanceRate,
        }
      })
    )

    return NextResponse.json({
      stats: {
        totalCounselors,
        totalClients,
        totalTasks,
        completedTasks,
      },
      counselors: counselorStats,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
