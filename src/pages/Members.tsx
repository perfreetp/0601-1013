import { useState, useMemo } from 'react';
import { Search, UserPlus, Trash2, ChevronDown, Shield, Pencil, Eye, FileCheck, Rocket, ArrowRight } from 'lucide-react';
import { useMemberStore } from '@/store/useMemberStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Modal, ModalBody } from '@/components/ui/Modal';
import { cn } from '@/utils/format';
import { ROLE_LABELS, ROLE_COLORS } from '@/utils/constants';
import type { MemberRole, OperationLog } from '@/types';

const roleIcons: Record<MemberRole, typeof Shield> = {
  admin: Shield,
  editor: Pencil,
  reviewer: FileCheck,
  publisher: Rocket,
  viewer: Eye,
};

const roleDescriptions: Record<MemberRole, string> = {
  admin: '拥有全部权限，可管理成员、配置系统',
  editor: '可上传素材、创建并剪辑视频项目',
  reviewer: '可审核视频内容，通过或驳回',
  publisher: '可设置排期、发布及下线视频',
  viewer: '仅可查看内容与数据，无操作权限',
};

const roleBadgeVariants: Record<MemberRole, 'danger' | 'primary' | 'accent' | 'success' | 'default'> = {
  admin: 'danger',
  editor: 'primary',
  reviewer: 'accent',
  publisher: 'success',
  viewer: 'default',
};

export default function Members() {
  const { members, logs, searchQuery, setSearch, removeMember, updateMemberRole } = useMemberStore();
  const [logFilterMember, setLogFilterMember] = useState<string>('all');
  const [logFilterAction, setLogFilterAction] = useState<string>('all');
  const [logFilterTargetMember, setLogFilterTargetMember] = useState<string>('all');
  const [openRoleDropdown, setOpenRoleDropdown] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  const actionTypes = useMemo(() => {
    const types = new Set(logs.map((l) => l.action));
    return Array.from(types);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    let result = [...logs];
    if (logFilterMember !== 'all') {
      result = result.filter((l) => l.memberId === logFilterMember);
    }
    if (logFilterAction !== 'all') {
      result = result.filter((l) => l.action === logFilterAction);
    }
    if (logFilterTargetMember !== 'all') {
      result = result.filter((l) => l.targetMemberId === logFilterTargetMember);
    }
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, logFilterMember, logFilterAction, logFilterTargetMember]);

  const handleRoleChange = (memberId: string, role: MemberRole) => {
    updateMemberRole(memberId, role);
    setOpenRoleDropdown(null);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatPreciseTime = (ts: string) => {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const h = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    const s = d.getSeconds().toString().padStart(2, '0');
    return `${y}-${m}-${day} ${h}:${min}:${s}`;
  };

  const getMemberAvatar = (memberId: string) => {
    const m = members.find((x) => x.id === memberId);
    return m?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberId}`;
  };

  const getMemberById = (memberId: string) => {
    return members.find((x) => x.id === memberId);
  };

  const getActionColor = (action: string) => {
    if (action.includes('通过') || action.includes('发布')) return 'bg-success-500';
    if (action.includes('驳回') || action.includes('移除') || action.includes('下线')) return 'bg-danger-500';
    if (action.includes('审核') || action.includes('设置')) return 'bg-warning-500';
    return 'bg-primary-500';
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="section-title">团队成员</h1>
        <p className="section-subtitle">管理团队成员，分配角色权限，追溯操作记录</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-220px)] min-h-[600px]">
        <div className="flex-1 space-y-6 overflow-y-auto pr-1" style={{ flexBasis: '60%' }}>
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>成员列表</CardTitle>
                  <CardDescription>共 {filteredMembers.length} 位成员</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="搜索姓名或邮箱..."
                      value={searchQuery}
                      onChange={(e) => setSearch(e.target.value)}
                      className="input pl-9 w-64"
                    />
                  </div>
                  <Button icon={<UserPlus className="w-4 h-4" />}>
                    邀请成员
                  </Button>
                </div>
              </div>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-y border-neutral-100">
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">成员</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">邮箱</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">角色</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">加入时间</th>
                    <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredMembers.map((member, idx) => (
                    <tr
                      key={member.id}
                      className="hover:bg-primary-50/50 transition-colors duration-150 group"
                      style={{ animation: `slideUp 0.4s ease-out ${idx * 0.05}s both` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full bg-neutral-100 ring-2 ring-white shadow-sm"
                          />
                          <div>
                            <p className="font-medium text-neutral-800">{member.name}</p>
                            <p className="text-xs text-neutral-400">ID: {member.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{member.email}</td>
                      <td className="px-6 py-4 relative">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenRoleDropdown(openRoleDropdown === member.id ? null : member.id)}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                              'border hover:shadow-md cursor-pointer',
                              ROLE_COLORS[member.role]
                            )}
                          >
                            {(() => {
                              const Icon = roleIcons[member.role];
                              return <Icon className="w-3.5 h-3.5" />;
                            })()}
                            {ROLE_LABELS[member.role]}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          {openRoleDropdown === member.id && (
                            <div className="absolute z-20 mt-1 left-0 min-w-[140px] bg-white rounded-xl border border-neutral-100 shadow-card-hover overflow-hidden animate-slide-in">
                              {(Object.keys(ROLE_LABELS) as MemberRole[]).map((role) => {
                                const Icon = roleIcons[role];
                                return (
                                  <button
                                    key={role}
                                    onClick={() => handleRoleChange(member.id, role)}
                                    className={cn(
                                      'w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors',
                                      member.role === role
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-neutral-600 hover:bg-neutral-50'
                                    )}
                                  >
                                    <Icon className="w-3.5 h-3.5" />
                                    {ROLE_LABELS[role]}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{member.createdAt.slice(0, 10)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => removeMember(member.id)}
                          className="text-neutral-400 hover:text-danger-600 hover:bg-danger-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          移除
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-neutral-400">
                        未找到匹配的成员
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>角色权限说明</CardTitle>
              <CardDescription>不同角色拥有不同的操作权限</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(Object.keys(ROLE_LABELS) as MemberRole[]).map((role, idx) => {
                  const Icon = roleIcons[role];
                  return (
                    <div
                      key={role}
                      className="p-4 rounded-xl border border-neutral-100 hover:border-primary-200 hover:bg-primary-50/40 transition-all duration-200"
                      style={{ animation: `slideUp 0.4s ease-out ${0.3 + idx * 0.08}s both` }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', ROLE_COLORS[role])}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <Badge variant={roleBadgeVariants[role]}>{ROLE_LABELS[role]}</Badge>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">{roleDescriptions[role]}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col overflow-hidden" style={{ flexBasis: '40%' }}>
          <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <CardTitle>操作日志</CardTitle>
                  <CardDescription>共 {filteredLogs.length} 条记录</CardDescription>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <select
                    value={logFilterMember}
                    onChange={(e) => setLogFilterMember(e.target.value)}
                    className="input py-2 text-xs !px-3 flex-1 bg-white"
                  >
                    <option value="all">操作人</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <select
                    value={logFilterAction}
                    onChange={(e) => setLogFilterAction(e.target.value)}
                    className="input py-2 text-xs !px-3 flex-1 bg-white"
                  >
                    <option value="all">操作类型</option>
                    {actionTypes.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <select
                  value={logFilterTargetMember}
                  onChange={(e) => setLogFilterTargetMember(e.target.value)}
                  className="input py-2 text-xs !px-3 w-full bg-white"
                >
                  <option value="all">被操作成员</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <div className="flex-1 overflow-y-auto px-2">
              <div className="relative pl-8 py-4 pr-2">
                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary-200 via-neutral-200 to-transparent" />
                {filteredLogs.length === 0 ? (
                  <div className="text-center text-neutral-400 py-16 text-sm">暂无日志记录</div>
                ) : (
                  filteredLogs.map((log: OperationLog, idx: number) => (
                    <div
                      key={log.id}
                      className="relative mb-5 last:mb-0 cursor-pointer"
                      style={{ animation: `slideIn 0.4s ease-out ${idx * 0.04}s both` }}
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className={cn(
                        'absolute -left-[26px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-md transition-transform duration-300 hover:scale-125',
                        getActionColor(log.action)
                      )} />
                      <div className="bg-neutral-50 hover:bg-primary-50/60 rounded-xl p-3.5 transition-all duration-200 hover:shadow-sm hover:-translate-x-0.5 border border-transparent hover:border-primary-100">
                        <div className="flex items-start gap-3">
                          <img
                            src={getMemberAvatar(log.memberId)}
                            alt={log.memberName}
                            className="w-8 h-8 rounded-full bg-white ring-2 ring-white shadow-sm flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-neutral-800">{log.memberName}</span>
                              <span className="text-xs text-primary-600 font-medium">{log.action}</span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5 truncate">
                              <span className="text-neutral-400">目标：</span>{log.target}
                            </p>
                            <p className="text-[11px] text-neutral-400 mt-1">{formatTime(log.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title="操作日志详情"
      >
        {selectedLog && (
          <ModalBody>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <img
                  src={getMemberAvatar(selectedLog.operatorId || selectedLog.memberId)}
                  alt={selectedLog.operatorName || selectedLog.memberName}
                  className="w-14 h-14 rounded-full bg-neutral-100 ring-2 ring-white shadow-md"
                />
                <div>
                  <p className="text-base font-semibold text-neutral-800">
                    {selectedLog.operatorName || selectedLog.memberName}
                  </p>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    操作人
                  </p>
                </div>
                <Badge variant="primary" className="ml-auto">
                  {selectedLog.action}
                </Badge>
              </div>

              <div className="h-px bg-neutral-100" />

              {selectedLog.targetMemberId && (
                <div className="flex items-center gap-4">
                  {(() => {
                    const targetMember = getMemberById(selectedLog.targetMemberId!);
                    return (
                      <>
                        <img
                          src={getMemberAvatar(selectedLog.targetMemberId!)}
                          alt={targetMember?.name || '未知成员'}
                          className="w-12 h-12 rounded-full bg-neutral-100 ring-2 ring-white shadow-sm"
                        />
                        <div>
                          <p className="text-sm font-medium text-neutral-800">
                            {targetMember?.name || '未知成员'}
                          </p>
                          {targetMember?.email && (
                            <p className="text-xs text-neutral-400 mt-0.5">{targetMember.email}</p>
                          )}
                          <p className="text-xs text-neutral-500 mt-1">被操作成员</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {(selectedLog.oldValue || selectedLog.newValue) && (
                <div className="bg-neutral-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-neutral-500 mb-3">变更内容</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {selectedLog.oldValue && (
                      <div className="bg-white rounded-lg px-4 py-2.5 border border-neutral-200">
                        <p className="text-[11px] text-neutral-400 mb-1">变更前</p>
                        <p className="text-sm font-medium text-neutral-700">{selectedLog.oldValue}</p>
                      </div>
                    )}
                    <ArrowRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                    {selectedLog.newValue && (
                      <div className="bg-primary-50 rounded-lg px-4 py-2.5 border border-primary-200">
                        <p className="text-[11px] text-primary-500 mb-1">变更后</p>
                        <p className="text-sm font-medium text-primary-700">{selectedLog.newValue}</p>
                      </div>
                    )}
                    {!selectedLog.newValue && selectedLog.oldValue && (
                      <div className="bg-danger-50 rounded-lg px-4 py-2.5 border border-danger-200">
                        <p className="text-[11px] text-danger-500 mb-1">状态</p>
                        <p className="text-sm font-medium text-danger-700">已移除</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-xs font-medium text-neutral-500 mb-2">操作目标</p>
                <p className="text-sm text-neutral-700">{selectedLog.target}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neutral-300" />
                <p className="text-xs text-neutral-500">
                  {formatPreciseTime(selectedLog.timestamp)}
                </p>
              </div>
            </div>
          </ModalBody>
        )}
      </Modal>
    </div>
  );
}
