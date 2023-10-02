with ua as (
select trim(substring(user_agent from (length(user_agent) - position(' ' in reverse(user_agent)) + 1))) as last_part,
user_agent
from public.web_access
where user_agent is not null
and web_access.user_agent not like '%Bot%' 
and web_access.user_agent not like '%bot%'
and web_access.user_agent not like '%grab%'
and web_access.user_agent not like '%Grab%'
group by 1,2
)

--select ua.last_part, user_agent from ua where ua.last_part like 'Safari%'

select sum (
	case 
	    when ua.last_part like 'Firefox%' then 1
	    else 0
	end) as Firefox,
	sum (
	case 
	    when ua.last_part like 'Safari%' 
	         and ua.user_agent like '%Mac%' then 1
	    else 0
	end) as Safari,
	sum (
	case 
	    when ua.last_part like 'Edg%' then 1
	    else 0
	end) as Edge,
	sum (
	case 
	    when ua.last_part like 'Chrome%' then 1
	    else 0
	end) as Chrome,
	sum (
	case
	    when ua.last_part like 'OPR%' then 1
	    else 0
	end) as Opera,
	sum (
	case 
	    when ua.last_part like 'Trident%' then 1
	    else 0
	end) as MSIE,
	sum (
	case 
	    when ua.last_part not like 'Chrome%' 
	         and ua.last_part not like 'OPR%'
	         and ua.last_part not like 'Edg%'
	         and (ua.last_part not like 'Safari%' or (ua.last_part like 'Safari%' and ua.user_agent not like '%Mac%'))
	         and ua.last_part not like 'Firefox%'
	         and ua.last_part not like 'Trident%' then 1
	    else 0
	end) as Others
from ua

