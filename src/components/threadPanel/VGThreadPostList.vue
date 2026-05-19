<script setup lang="ts">
import { computed, ref } from 'vue';
import { RecycleScroller } from 'vue-virtual-scroller';
import { VGPost } from '../../app/VGPost';
import { VGThread } from '../../app/VGThread';
import VGThreadEntry from './VGThreadEntry.vue';

const props = defineProps<{
    thread: VGThread | null;
    currentPost: VGPost | null;
}>();

const emit = defineEmits<{
    select: [post: VGPost];
}>();

/////

const posts = computed(() =>
  props.thread?.PostIDs.map((id) => props.thread!.Posts.get(id)).filter((p) => p !== undefined) ?? []
);
const scroller = ref<InstanceType<typeof RecycleScroller> | null>(null);
const jumpInput = ref('');

/////

function JumpToIndex() {
    const index = parseInt(jumpInput.value) - 1;

    if (!isNaN(index) && index >= 0 && index < posts.value.length) {
        scroller.value?.scrollToItem(index);
        emit('select', posts.value[index]);
    }

    jumpInput.value = '';
}
</script>

<template>
    <div id="VGPostEntriesContainer">
        <div id="VGThreadPostsInfo">
            <p id="VGThreadName">{{ thread?.ThreadName }}</p>
            <p id="VGThreadPostCount">{{ thread?.PostCount ?? 0 }} galleries</p>
            <input
                id="VGJumpToIndex"
                v-model="jumpInput"
                type="number"
                min="1"
                :max="posts.length"
                placeholder="Go to #"
                @keydown.enter="JumpToIndex"
            />
        </div>

        <RecycleScroller
            ref="scroller"
            :items="posts"
            :item-size="125"
            key-field="PostID"
            direction="vertical"
            v-slot="{ item, index }"
        >
            <VGThreadEntry
                :post="item"
                :index="index"
                :class="{ VGThreadEntrySelected: currentPost === item }"
                @select="emit('select', item)"
            />
        </RecycleScroller>
    </div>
</template>

<style scoped>
#VGThreadPostsInfo
{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100px;
    margin-bottom: 10px;
    color: white;
    font-family: sans-serif;
    text-align: center;
}

#VGThreadName
{
    margin: 0;
    width: 90%;
    font-size: 20px;
    font-weight: bold;
    overflow: hidden;
    flex-grow: 0.5;
}

#VGThreadPostCount
{
    margin: 0;
    flex-shrink: 0;
    font-size: 15px;
    display: flex;
    align-items: center;
}

#VGJumpToIndex
{
    margin-top: 6px;
    width: 80px;
    padding: 2px 6px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 4px;
    color: white;
    font-size: 13px;
    text-align: center;
    outline: none;
}

#VGJumpToIndex::placeholder
{
    color: rgba(255,255,255,0.4);
}

#VGJumpToIndex::-webkit-inner-spin-button,
#VGJumpToIndex::-webkit-outer-spin-button
{
    -webkit-appearance: none;
}

#VGPostEntriesContainer
{
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: calc(min(500px, 100%) + 1px);
    box-sizing: border-box;
    overflow: hidden;
    padding-top: 80px;
    background-color: black;
    border: none;
    border-right: var(--vg-panel-border-color) 1px solid;
}

#VGPostEntriesContainer .vue-recycle-scroller
{
    height: calc(100% - 100px);
    overscroll-behavior: none;
    padding-bottom: 200px;
    box-sizing: border-box;
}
</style>
