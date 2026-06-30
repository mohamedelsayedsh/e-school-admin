import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

// Services
import { UserService } from '../../core/services/user';
import { IncidentService } from '../../core/services/incident';
import { QuizService } from '../../core/services/quiz';
import { ReportService } from '../../core/services/report';

// Models
import { User } from '../../core/models/user';
import { Incident } from '../../core/models/incident';
import { Quiz, QuizAnalysis } from '../../core/models/quiz';
import { ReportInterface } from '../../core/models/report';

// Shared
import { Navbar } from "../../shared/navbar/navbar";
import { StatCard } from './components/stat-card/stat-card';
import { IncidentsTrendChart } from './components/incidents-trend-chart/incidents-trend-chart';
import { RiskDistributionChart } from './components/risk-distribution-chart/risk-distribution-chart';
import { RecentIncidentsList } from './components/recent-incidents-list/recent-incidents-list';
import { TopHighRiskStudents } from './components/top-high-risk-students/top-high-risk-students';
import { AiSchoolHealthCard } from './components/ai-school-health-card/ai-school-health-card';
import { QuickActions } from './components/quick-actions/quick-actions';
import { RecentReportsList } from './components/recent-reports-list/recent-reports-list';
import { Spinner } from "../../shared/spinner/spinner";
import { QuizzesPreviewList } from './components/quizzes-preview-list/quizzes-preview-list';

// Separated Dashboard Components

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    Navbar,
    StatCard,
    IncidentsTrendChart,
    RiskDistributionChart,
    RecentIncidentsList,
    RecentReportsList,
    TopHighRiskStudents,
    QuizzesPreviewList,
    AiSchoolHealthCard,
    QuickActions,
    Spinner
],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private userService = inject(UserService);
  private incidentService = inject(IncidentService);
  private quizService = inject(QuizService);
  private reportService = inject(ReportService);

  isLoading = signal(true);

  users = signal<User[]>([]);
  incidents = signal<Incident[]>([]);
  quizAnalyses = signal<QuizAnalysis[]>([]);
  quizzes = signal<Quiz[]>([]);
  reports = signal<ReportInterface[]>([]);

  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  ngOnInit(): void {
    forkJoin({
      users: this.userService.getAllUsers(),
      incidents: this.incidentService.getAllIncidents(),
      quizAnalyses: this.quizService.getAllQuizAnalyses(),
      quizzes: this.quizService.getAllQuizzes(),
      reports: this.reportService.getAllReports(),
    }).subscribe({
      next: (res) => {
        this.users.set(res.users.result || []);
        this.incidents.set((res.incidents.result || res.incidents.data || res.incidents) ?? []);
        this.quizAnalyses.set(res.quizAnalyses.result || []);
        this.quizzes.set(res.quizzes.result || []);
        this.reports.set(res.reports.result || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Dashboard load error:', err);
        this.isLoading.set(false);
      },
    });
  }

  private userMap = computed(() => {
    const map = new Map<number, User>();
    this.users().forEach((u) => map.set(u.id, u));
    return map;
  });

  private isThisWeek(dateStr: string): boolean {
    const date = new Date(dateStr);
    const now = new Date();
    const startOfWeek = new Date(now);
    const dayOffset = (now.getDay() + 6) % 7;
    startOfWeek.setDate(now.getDate() - dayOffset);
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek && date <= now;
  }

  // ---------- Stat cards ----------
  totalStudents = computed(
    () => this.users().filter((u) => u.role?.roleName?.toLowerCase() === 'student').length
  );

  incidentsThisWeek = computed(
    () => this.incidents().filter((i) => this.isThisWeek(i.createdAt)).length
  );

  totalReports = computed(() => this.reports().length);

  pendingReports = computed(
    () => this.reports().filter((r) => r.status?.toLowerCase() === 'pending').length
  );

  // ---------- Incidents trend (line chart) ----------
  incidentsTrend = computed(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    this.incidents().forEach((i) => {
      if (!this.isThisWeek(i.createdAt)) return;
      const day = new Date(i.createdAt).getDay();
      const idx = (day + 6) % 7;
      counts[idx]++;
    });
    return counts;
  });

  trendLinePoints = computed(() => {
    const counts = this.incidentsTrend();
    const max = Math.max(...counts, 5);
    const stepX = 600 / 6;
    return counts
      .map((c, i) => {
        const x = i * stepX;
        const y = 140 - (c / max) * 130;
        return `${x},${y}`;
      })
      .join(' ');
  });

  trendDots = computed(() => {
    const counts = this.incidentsTrend();
    const max = Math.max(...counts, 5);
    const stepX = 600 / 6;
    return counts.map((c, i) => ({
      x: i * stepX,
      y: 140 - (c / max) * 130,
      value: c,
    }));
  });

  // ---------- Risk distribution (donut) ----------
  riskDistribution = computed(() => {
    const reports = this.reports();
    const total = reports.length || 1;
    const high = reports.filter((r) => r.riskLevel?.toLowerCase() === 'high').length;
    const medium = reports.filter((r) => r.riskLevel?.toLowerCase() === 'medium').length;
    const low = reports.filter((r) => r.riskLevel?.toLowerCase() === 'low').length;
    return {
      high: { count: high, pct: Math.round((high / total) * 100) },
      medium: { count: medium, pct: Math.round((medium / total) * 100) },
      low: { count: low, pct: Math.round((low / total) * 100) },
    };
  });

  donutGradient = computed(() => {
    const d = this.riskDistribution();
    const highEnd = d.high.pct;
    const mediumEnd = highEnd + d.medium.pct;
    return `conic-gradient(
      #dc2626 0% ${highEnd}%,
      #d97706 ${highEnd}% ${mediumEnd}%,
      #059669 ${mediumEnd}% 100%
    )`;
  });

  // ---------- AI School Health ----------
  overallHealth = computed(() => {
    const d = this.riskDistribution();
    const total = d.high.count + d.medium.count + d.low.count;
    if (total === 0) return 100;
    return Math.round(((d.low.count * 1 + d.medium.count * 0.5) / total) * 100);
  });

  healthLabel = computed(() => {
    const score = this.overallHealth();
    if (score >= 70) return 'Healthy';
    if (score >= 40) return 'Moderate';
    return 'At Risk';
  });

  mostDetectedBehavior = computed(() => this.mode(this.incidents().map((i) => i.behavior)));
  averageEmotion = computed(() => this.mode(this.incidents().map((i) => i.emotion)));

  studentsNeedingAttention = computed(() => {
    const ids = new Set<number>();
    this.reports()
      .filter((r) => r.riskLevel?.toLowerCase() === 'high')
      .forEach((r) => ids.add(r.studentId));
    return ids.size;
  });

  private mode(values: string[]): string {
    if (values.length === 0) return 'N/A';
    const counts = new Map<string, number>();
    values.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  // ---------- Recent lists ----------
  recentIncidents = computed(() =>
    [...this.incidents()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((i) => ({
        ...i,
        studentName: this.userMap().get(i.studentId)?.userName || `Student #${i.studentId}`,
      }))
  );

  recentReports = computed(() =>
    [...this.reports()]
      .slice(-5)
      .reverse()
      .map((r) => ({
        ...r,
        studentName: this.userMap().get(r.studentId)?.userName || `Student #${r.studentId}`,
      }))
  );

  topHighRiskStudents = computed(() => {
    const byStudent = new Map<number, number>();
    this.quizAnalyses().forEach((q) => {
      const current = byStudent.get(q.studentId) ?? 0;
      if (q.risk_score > current) byStudent.set(q.studentId, q.risk_score);
    });
    return [...byStudent.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([studentId, score]) => ({
        studentId,
        studentName: this.userMap().get(studentId)?.userName || `Student #${studentId}`,
        scorePct: Math.round(score * 100),
        level: score >= 0.7 ? 'High' : score >= 0.4 ? 'Medium' : 'Low',
      }));
  });

  recentQuizzes = computed(() =>
    [...this.quizzes()]
      .slice(-5)
      .reverse()
      .map((q) => ({
        ...q,
        questionCount: q.questions?.length ?? 0,
      }))
  );

  riskBadgeClass(level: string | undefined): string {
    switch (level?.toLowerCase()) {
      case 'high':
      case 'severe':
        return 'risk-high';
      case 'medium':
      case 'moderate':
        return 'risk-medium';
      default:
        return 'risk-low';
    }
  }

  fillClass(level: string | undefined): string {
    switch (level?.toLowerCase()) {
      case 'high':
      case 'severe':
        return 'fill-high';
      case 'medium':
      case 'moderate':
        return 'fill-medium';
      default:
        return 'fill-low';
    }
  }
}
