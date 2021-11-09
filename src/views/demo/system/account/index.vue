<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <BasicTable
      @register="registerTable"
      :searchInfo="searchInfo"
      :rowSelection="{ type: 'checkbox' }"
    >
      <template #toolbar>
        <a-button type="error" :disabled="!selects().length" @click="handleDelete">{{
          t('routes.demo.system.moElseName.massDeletion')
        }}</a-button>
        <a-button type="primary" @click="handleCreate">{{
          t('routes.demo.system.moElseName.addUser')
        }}</a-button>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: 'clarity:info-standard-line',
              tooltip: t('routes.demo.system.moElseName.look'),
              onClick: handleView.bind(null, record),
            },
            {
              icon: 'clarity:note-edit-line',
              tooltip: t('routes.demo.system.moElseName.editUser_'),
              onClick: handleEdit.bind(null, record),
            },
            {
              icon: 'ant-design:delete-outlined',
              color: 'error',
              tooltip: t('routes.demo.system.moElseName.delete'),
              popConfirm: {
                title: t('routes.demo.system.moElseName.deleteOk'),
                confirm: handleDelete.bind(null, record),
              },
            },
          ]"
        />
      </template>
    </BasicTable>
    <AccountModal @register="registerModal" />
  </PageWrapper>
</template>
<script lang="ts">
  import { defineComponent, reactive, computed, ref } from 'vue';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getAccountList, deleteUser } from '/@/api/demo/system';
  import { PageWrapper } from '/@/components/Page';

  import { useModal } from '/@/components/Modal';
  import AccountModal from './AccountModal.vue';

  import { columns, searchFormSchema } from './account.data';
  import { useGo } from '/@/hooks/web/usePage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';

  export default defineComponent({
    name: 'AccountManagement',
    components: { BasicTable, PageWrapper, AccountModal, TableAction },
    setup() {
      const go = useGo();
      const { t } = useI18n();
      const [registerModal, { openModal }] = useModal();
      const { createMessage } = useMessage();

      const searchInfo = reactive<Recordable>({});
      const [registerTable, { reload, updateTableDataRecord, getSelectRowKeys }] = useTable({
        title: '账号列表',
        api: getAccountList,
        rowKey: 'id',
        columns,
        formConfig: {
          labelWidth: 70,
          schemas: searchFormSchema,
          autoSubmitOnEnter: true,
        },
        useSearchForm: true,
        showTableSetting: true,
        bordered: true,
        handleSearchInfoFn(info) {
          console.log('handleSearchInfoFn', info);
          return info;
        },
        actionColumn: {
          width: 120,
          title: '操作',
          dataIndex: 'action',
          slots: { customRender: 'action' },
        },
      });
      const selects = ref([]);
      selects.value = () => getSelectRowKeys();

      function handleCreate() {
        openModal(true, {
          isUpdate: false,
        });
      }

      function handleEdit(record: Recordable) {
        console.log(record);
        openModal(true, {
          record,
          isUpdate: true,
        });
      }

      async function handleDelete(record: Recordable) {
        const ids = { ids: selects.value() };
        const id = { id: record.id };
        const params = id.record ? id : ids;
        const result = await deleteUser(params);
        if (result) {
          createMessage.success('删除成功！');
          reload();
        }
      }
      // function handleSuccess({ isUpdate, values }) {
      //   if (isUpdate) {
      //     // 演示不刷新表格直接更新内部数据。
      //     // 注意：updateTableDataRecord要求表格的rowKey属性为string并且存在于每一行的record的keys中
      //     const result = updateTableDataRecord(values.id, values);
      //     console.log('result', result);
      //   } else {
      //     reload();
      //   }
      // }

      function handleSelect(deptId = '') {
        searchInfo.deptId = deptId;
        reload();
      }

      function handleView(record: Recordable) {
        go('/system/account_detail/' + record.id);
      }

      return {
        registerTable,
        registerModal,
        handleCreate,
        handleEdit,
        handleDelete,
        handleSuccess,
        handleSelect,
        handleView,
        searchInfo,
        t,
        selects,
      };
    },
  });
</script>
