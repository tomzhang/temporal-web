<template>
  <section class="workflow-summary">
    <aside class="actions">
      <feature-flag name="workflow-terminate">
        <a
          href=""
          class="terminate"
          v-show="isWorkflowRunning"
          @click.prevent="$modal.show('confirm-termination')"
        >
          Terminate
        </a>
      </feature-flag>
    </aside>

    <modal name="confirm-termination">
      <h3>Are you sure you want to terminate this workflow?</h3>
      <input v-model="terminationReason" placeholder="Reason" />
      <footer>
        <a href="#" class="terminate" @click.prevent="terminate">
          Terminate
        </a>
        <a
          href="#"
          class="cancel"
          @click.prevent="$modal.hide('confirm-termination')"
        >
          Cancel
        </a>
      </footer>
    </modal>

    <dl v-if="workflow">
      <div v-if="workflow.workflowExecutionInfo.isArchived">
        <h5>Workflow archived</h5>
        <p>
          This workflow has been retrieved from archival. Some summary
          information may be missing.
        </p>
      </div>
      <div class="workflow-name">
        <dt>Workflow Name</dt>
        <dd>{{ workflow.workflowExecutionInfo.type.name }}</dd>
      </div>
      <div class="started-at">
        <dt>Started At</dt>
        <dd>{{ workflowStartTime }}</dd>
      </div>
      <div class="close-time" v-if="workflowCloseTime">
        <dt>Closed Time</dt>
        <dd>{{ workflowCloseTime }}</dd>
      </div>
      <div
        class="workflow-status"
        :data-status="
          wfStatus !== undefined &&
            (typeof wfStatus === 'string' ? wfStatus : wfStatus.status)
        "
      >
        <dt>Status</dt>
        <dd>
          <bar-loader v-if="wfStatus === 'running'" />
          <span v-if="typeof wfStatus === 'string'">{{ wfStatus }}</span>
          <router-link
            v-if="wfStatus !== undefined && wfStatus.to"
            :to="wfStatus.to"
          >
            {{ wfStatus.text }}
          </router-link>
        </dd>
      </div>
      <div class="workflow-result" v-if="result">
        <dt>Result</dt>
        <dd>
          <data-viewer :item="result" :title="workflowId + ' Result'" />
        </dd>
      </div>
      <div class="workflow-id">
        <dt>Workflow Id</dt>
        <dd>{{ workflowId }}</dd>
      </div>
      <div class="run-id">
        <dt>Run Id</dt>
        <dd>{{ runId }}</dd>
      </div>
      <div class="parent-workflow" v-if="parentWorkflowRoute">
        <dt>Parent Workflow</dt>
        <dd>
          <router-link :to="parentWorkflowRoute.to">
            {{ parentWorkflowRoute.text }}
          </router-link>
        </dd>
      </div>
      <div class="task-list">
        <dt>Task List</dt>
        <dd>
          <router-link
            :to="{
              name: 'task-list',
              params: {
                taskList: workflow.executionConfiguration.taskList.name,
              },
            }"
          >
            {{ workflow.executionConfiguration.taskList.name }}
          </router-link>
        </dd>
      </div>
      <div class="history-length">
        <dt>History Events</dt>
        <dd>{{ workflow.workflowExecutionInfo.historyLength }}</dd>
      </div>
      <div class="workflow-input">
        <dt>Input</dt>
        <dd>
          <data-viewer
            v-if="input !== undefined"
            :item="input"
            :title="workflowId + ' Input'"
          />
        </dd>
      </div>
      <div class="pending-activities" v-if="workflow.pendingActivities">
        <dt>Pending Activities</dt>
        <dd v-for="pa in workflow.pendingActivities" :key="pa.activityId">
          <detail-list :item="pa" />
        </dd>
      </div>
    </dl>
  </section>
</template>

<script>
import moment from 'moment';
import { TERMINATE_DEFAULT_ERROR_MESSAGE } from './constants';
import { NOTIFICATION_TYPE_ERROR, NOTIFICATION_TYPE_SUCCESS } from '~constants';
import { getErrorMessage } from '~helpers';
import { BarLoader, DataViewer, DetailList, FeatureFlag } from '~components';

export default {
  data() {
    return {
      terminationReason: undefined,
    };
  },
  props: [
    'baseAPIURL',
    'input',
    'isWorkflowRunning',
    'parentWorkflowRoute',
    'result',
    'runId',
    'wfStatus',
    'workflow',
    'workflowId',
  ],
  components: {
    'bar-loader': BarLoader,
    'data-viewer': DataViewer,
    'detail-list': DetailList,
    'feature-flag': FeatureFlag,
  },
  computed: {
    workflowCloseTime() {
      return this.workflow.workflowExecutionInfo.closeTime
        ? moment(this.workflow.workflowExecutionInfo.closeTime).format(
            'dddd MMMM Do, h:mm:ss a'
          )
        : '';
    },
    workflowStartTime() {
      return moment(this.workflow.workflowExecutionInfo.startTime).format(
        'dddd MMMM Do, h:mm:ss a'
      );
    },
  },
  methods: {
    terminate() {
      this.$modal.hide('confirm-termination');
      this.$http
        .post(`${this.baseAPIURL}/terminate`, {
          reason: this.terminationReason,
        })
        .then(
          r => {
            this.$emit('onNotification', {
              message: 'Workflow terminated.',
              type: NOTIFICATION_TYPE_SUCCESS,
            });
            // eslint-disable-next-line no-console
            console.dir(r);
          },
          error => {
            this.$emit('onNotification', {
              message: getErrorMessage(error, TERMINATE_DEFAULT_ERROR_MESSAGE),
              type: NOTIFICATION_TYPE_ERROR,
            });
          }
        );
    },
  },
};
</script>

<style lang="stylus">
@require "../../styles/definitions.styl"

section.workflow-summary
  overflow auto
  padding layout-spacing-small

  .pending-activities {
    dl.details {
      dd {
        white-space: normal;
      }
    }
  }

  dl:not(.details)
    & > div
      margin-bottom 1em
      & > dt
        text-transform uppercase
        font-size 11px
      dd, dt
        line-height 1.5em
  dl.details
    border 1px solid uber-black-60
    margin-bottom 1em
    dt
      padding 0 4px
  .run-id, .task-list, .workflow-id, .workflow-name
    dd
      font-weight 300
      font-family monospace-font-family
  .workflow-status
    dd
      text-transform capitalize
    &[data-status="completed"] dd
      color uber-green
    &[data-status="failed"] dd
      color uber-orange
  pre
    max-height 18vh

  aside.actions
    float right
    a
      action-button(uber-orange)

[data-modal="confirm-termination"]
  input
    margin layout-spacing-medium 0
  footer
    display flex
    justify-content space-between
  a.terminate
    action-button(uber-orange)
  a.cancel
    action-button()
</style>
