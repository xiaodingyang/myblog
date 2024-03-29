<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <BasicTable @register="registerTable" :searchInfo="searchInfo">
      <template #toolbar>
        <PopConfirmButton
          type="error"
          :disabled="!selects().length"
          title="确定删除？"
          ok-text="是"
          cancel-text="否"
          @confirm="handleDelete"
          >{{ t('routes.demo.system.moElseName.massDeletion') }}
        </PopConfirmButton>
        <a-button type="primary" @click="handleCreate">{{
          t('routes.demo.system.moElseName.addUser')
        }}</a-button>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: 'clarity:info-standard-line',
              tooltip: '查看详情',
              onClick: handleView.bind(null, record),
            },
            {
              icon: 'clarity:note-edit-line',
              tooltip: '编辑用户',
              onClick: handleEdit.bind(null, record),
            },
            {
              icon: 'ant-design:delete-outlined',
              color: 'error',
              tooltip: '删除用户',
              popConfirm: {
                title: '确定删除？',
                confirm: handleDelete.bind(null, record),
              },
            },
          ]"
        />
      </template>
    </BasicTable>
    <AccountModal @register="registerModal" @success="handleFormSuccess" />
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
  import { PopConfirmButton } from '/@/components/Button';

  export default defineComponent({
    name: 'AccountManagement',
    components: { BasicTable, PageWrapper, AccountModal, TableAction, PopConfirmButton },
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
          schemas: searchFormSchema,
          autoSubmitOnEnter: true,
          labelAlign: 'right',
        },
        rowSelection: { type: 'checkbox' },
        clickToRowSelect: false,
        useSearchForm: true,
        showTableSetting: true,
        bordered: true,
        handleSearchInfoFn(info) {
          // 可以在查询前做一些操作
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

      function handleFormSuccess() {
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
        handleView,
        searchInfo,
        t,
        selects,
        handleFormSuccess,
      };
    },
  });
</script>
