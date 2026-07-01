frappe.query_reports['User Growth Overview'] = {
  filters: [
    {
      fieldname: 'from_date',
      label: __('起始日期'),
      fieldtype: 'Date',
    },
    {
      fieldname: 'to_date',
      label: __('结束日期'),
      fieldtype: 'Date',
    },
    {
      fieldname: 'region',
      label: __('地区'),
      fieldtype: 'Select',
      options: '\n华东\n华南\n华北\n西南\n华中\n西北',
    },
    {
      fieldname: 'channel',
      label: __('来源渠道'),
      fieldtype: 'Select',
      options: '\n官网注册\n渠道伙伴\n销售外呼\n内容投放\n线下活动\n老客推荐',
    },
    {
      fieldname: 'plan',
      label: __('套餐'),
      fieldtype: 'Select',
      options: '\nStarter\nGrowth\nBusiness\nEnterprise',
    },
    {
      fieldname: 'service_status',
      label: __('服务状态'),
      fieldtype: 'Select',
      options: '\n试用\n活跃\n流失',
    },
  ],
};
