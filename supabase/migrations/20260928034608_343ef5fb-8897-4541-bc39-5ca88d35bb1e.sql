
revoke execute on function public.notify(uuid,text,text,text,text) from authenticated;
revoke execute on function public.notify_staff(text,text,text) from authenticated;
revoke execute on function public.notify_athlete_circle(uuid,text,text,text) from authenticated;
revoke execute on function public.log_audit(text,text,text,jsonb) from authenticated;
revoke execute on function public.next_process_number() from authenticated;
revoke execute on function public.refresh_player_statistics(uuid) from authenticated;
revoke execute on function public.trg_audit() from authenticated;
revoke execute on function public.trg_refresh_stats() from authenticated;
revoke execute on function public.trg_notify_evaluation() from authenticated;
revoke execute on function public.trg_notify_training() from authenticated;
revoke execute on function public.trg_notify_callup() from authenticated;
revoke execute on function public.trg_notify_announcement() from authenticated;
revoke execute on function public.trg_announcement_notify_after() from authenticated;
revoke execute on function public.guard_profile_update() from authenticated;
revoke execute on function public.guard_athlete_update() from authenticated;
create policy "sem acesso direto" on public.process_counters for select to authenticated using (false);
